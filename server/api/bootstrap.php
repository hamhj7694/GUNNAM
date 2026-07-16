<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
const GUNNAM_JSON_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
function request_id():string{static $id=null;if($id===null){$v=$_SERVER['HTTP_X_REQUEST_ID']??'';$id=is_string($v)&&preg_match('/^[\x21-\x7E]{8,100}$/',$v)?$v:'req_'.bin2hex(random_bytes(12));}return $id;}
function json_response(int $s,array $b):never{http_response_code($s);header('Content-Type: application/json; charset=utf-8');header('X-Request-ID: '.request_id());header('Cache-Control: no-store');echo json_encode($b,GUNNAM_JSON_FLAGS|JSON_THROW_ON_ERROR);exit;}
function success_response(int $s,array $d):never{json_response($s,['data'=>$d]);}
function error_response(int $s,string $c,string $m,?array $f=null):never{json_response($s,['code'=>$c,'message'=>$m,'fieldErrors'=>$f,'requestId'=>request_id()]);}
function load_config():array{$p=__DIR__.'/config.php';if(!is_file($p))error_response(500,'INTERNAL_ERROR','서버 설정이 완료되지 않았습니다.');$c=require $p;if(!is_array($c)||!isset($c['db']['dsn'],$c['db']['user'],$c['db']['password'],$c['app_base_url'],$c['hmac_secret'],$c['session_save_path'],$c['rate_limit_path'])||!is_string($c['hmac_secret'])||strlen($c['hmac_secret'])<64)error_response(500,'INTERNAL_ERROR','서버 설정 형식이 올바르지 않습니다.');return $c;}
function configure_cors(array $c):void{$o=$_SERVER['HTTP_ORIGIN']??'';$a=$c['allowed_origins']??[];if($o!==''&&!in_array($o,$a,true))error_response(403,'MANAGEMENT_ACCESS_DENIED','허용되지 않은 요청 출처입니다.');if($o!==''){header('Access-Control-Allow-Origin: '.$o);header('Vary: Origin');header('Access-Control-Allow-Headers: Content-Type, Idempotency-Key, Authorization, X-Request-ID');header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');header('Access-Control-Allow-Credentials: true');}if(($_SERVER['REQUEST_METHOD']??'GET')==='OPTIONS'){http_response_code(204);exit;}}
function database(array $c):PDO{try{$db=new PDO($c['db']['dsn'],$c['db']['user'],$c['db']['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false,PDO::MYSQL_ATTR_INIT_COMMAND=>'SET NAMES utf8mb4']);$db->exec("SET time_zone = '+00:00'");return $db;}catch(Throwable $e){error_log('Gunnam DB unavailable; requestId='.request_id());error_response(503,'SERVICE_UNAVAILABLE','잠시 후 다시 시도해 주세요.');}}
function read_json_body():array{$ct=strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]));if($ct!=='application/json')error_response(415,'UNSUPPORTED_MEDIA_TYPE','Content-Type은 application/json이어야 합니다.');$r=file_get_contents('php://input');if($r===false||strlen($r)>32768)error_response(422,'VALIDATION_FAILED','요청 본문은 32 KiB 이하여야 합니다.');try{$v=json_decode($r,false,32,JSON_THROW_ON_ERROR);}catch(JsonException $e){error_response(400,'INVALID_JSON','JSON 형식이 올바르지 않습니다.');}if(!$v instanceof stdClass)error_response(400,'INVALID_JSON','JSON 객체를 전송해 주세요.');return get_object_vars($v);}
function idempotency_key():string{$v=$_SERVER['HTTP_IDEMPOTENCY_KEY']??'';if(!is_string($v)||!preg_match('/^[A-Za-z0-9._:-]{16,128}$/',$v))error_response(400,'MISSING_IDEMPOTENCY_KEY','유효한 Idempotency-Key 헤더가 필요합니다.');return $v;}
function authorization_header():string{
    foreach(['HTTP_AUTHORIZATION','REDIRECT_HTTP_AUTHORIZATION'] as $key){
        $value=$_SERVER[$key]??null;
        if(is_string($value)&&trim($value)!=='')return trim($value);
    }
    if(function_exists('getallheaders')){
        $headers=getallheaders();
        if(is_array($headers))foreach($headers as $name=>$value)if(is_string($name)&&strcasecmp($name,'Authorization')===0&&is_string($value))return trim($value);
    }
    return '';
}
function bearer_token():string{$h=authorization_header();if(!preg_match('/^Bearer\s+(m_[A-Za-z0-9_-]{43})$/',$h,$m))error_response(410,'MANAGEMENT_TOKEN_INVALID','관리 링크가 유효하지 않습니다.');return $m[1];}
function token_digest(string $t):string{return hash('sha256',$t);}
function derived_token(string $p,string $n,string $k,string $s):string{return $p.rtrim(strtr(base64_encode(hash_hmac('sha256',$n."\0".$k,$s,true)),'+/','-_'),'=');}
function assert_known_fields(array $i,array $a):void{$u=array_values(array_diff(array_keys($i),$a));if($u!==[])error_response(422,'UNKNOWN_FIELD','계약에 없는 입력 필드가 있습니다.',['_unknown'=>array_map(fn($n)=>$n.' 필드는 사용할 수 없습니다.',$u)]);}
function text_field(array $i,string $n,int $max,bool $req=false):?string{$v=$i[$n]??null;if($v===null&&!$req)return null;if(!is_string($v))error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',[$n=>['문자열이어야 합니다.']]);$v=trim($v);if($req&&$v==='')error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',[$n=>['필수 입력입니다.']]);if($v==='')return null;if(mb_strlen($v,'UTF-8')>$max)error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',[$n=>[$max.'자 이하여야 합니다.']]);if(preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',$v))error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',[$n=>['제어문자를 포함할 수 없습니다.']]);return $v;}
function decode_payload(string $p):array{try{$d=json_decode($p,true,32,JSON_THROW_ON_ERROR);return is_array($d)?$d:[];}catch(JsonException $e){return [];}}
function utc_datetime(string $d):string{return(new DateTimeImmutable($d,new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z');}
function card_dto(array $r):array{$p=decode_payload($r['payload']);return['id'=>(string)$r['id'],'questionText'=>$p['questionText']??'','acceptButtonText'=>$p['acceptButtonText']??'좋아요','rejectButtonText'=>$p['rejectButtonText']??'싫어요','acceptResultText'=>$p['acceptResultText']??null,'rejectResultText'=>$p['rejectResultText']??null,'responseVisibility'=>$r['response_visibility']??'owner_only','responseStatus'=>$r['status']==='open'?'open':'closed','createdAt'=>utc_datetime($r['created_at']),'updatedAt'=>utc_datetime($r['updated_at'])];}
function ensure_runtime_directory(string $directory):void{
    if($directory===''||(!is_dir($directory)&&!@mkdir($directory,0700,true)&&!is_dir($directory))||!is_writable($directory))error_response(503,'SERVICE_UNAVAILABLE','서버 저장소를 사용할 수 없습니다.');
    @chmod($directory,0700);
}
function start_management_session(array $c):void{if(session_status()===PHP_SESSION_ACTIVE)return;ensure_runtime_directory($c['session_save_path']);session_save_path($c['session_save_path']);ini_set('session.gc_maxlifetime','43200');session_name('gunnam_manage_session');session_set_cookie_params(['lifetime'=>43200,'path'=>'/gunnam/api/v1/manage','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);if(!session_start())error_response(503,'SERVICE_UNAVAILABLE','관리 세션을 시작할 수 없습니다.');}

function rate_limit(array $config,string $scope,string $resource,int $limit,int $windowSeconds):void{
    $ip=$_SERVER['REMOTE_ADDR']??'';
    if(!is_string($ip)||filter_var($ip,FILTER_VALIDATE_IP)===false)error_response(503,'SERVICE_UNAVAILABLE','요청 정보를 확인할 수 없습니다.');
    $directory=rtrim($config['rate_limit_path'],'/\\');
    ensure_runtime_directory($directory);
    $subject=hash_hmac('sha256',$scope."\0".$ip."\0".$resource,$config['hmac_secret']);
    $path=$directory.DIRECTORY_SEPARATOR.$scope.'-'.$subject.'.json';
    $handle=fopen($path,'c+');if($handle!==false)@chmod($path,0600);
    if($handle===false||!flock($handle,LOCK_EX)){if(is_resource($handle))fclose($handle);error_response(503,'SERVICE_UNAVAILABLE','요청 제한을 확인할 수 없습니다.');}
    $now=time();$raw=stream_get_contents($handle);$events=[];
    if(is_string($raw)&&$raw!==''){$decoded=json_decode($raw,true);if(is_array($decoded))$events=array_values(array_filter($decoded,static fn($time):bool=>is_int($time)&&$time>$now-$windowSeconds));}
    if(count($events)>=$limit){$retry=max(1,($events[0]+$windowSeconds)-$now);flock($handle,LOCK_UN);fclose($handle);header('Retry-After: '.(string)$retry);error_response(429,'RATE_LIMITED','요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');}
    $events[]=$now;rewind($handle);ftruncate($handle,0);fwrite($handle,json_encode($events,JSON_THROW_ON_ERROR));fflush($handle);flock($handle,LOCK_UN);fclose($handle);
}

function base64url_encode(string $value):string{return rtrim(strtr(base64_encode($value),'+/','-_'),'=');}
function base64url_decode(string $value):string|false{$padding=(4-strlen($value)%4)%4;return base64_decode(strtr($value,'-_','+/').str_repeat('=',$padding),true);}
function encode_response_cursor(array $config,string $createdAt,string $id):string{$payload=base64url_encode(json_encode(['createdAt'=>$createdAt,'id'=>$id],JSON_THROW_ON_ERROR));$signature=base64url_encode(hash_hmac('sha256','responses-cursor'."\0".$payload,$config['hmac_secret'],true));return $payload.'.'.$signature;}
function decode_response_cursor(array $config,string $cursor):array{if(strlen($cursor)>1024||!preg_match('/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/',$cursor,$m))error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',['cursor'=>['유효하지 않은 cursor입니다.']]);$expected=hash_hmac('sha256','responses-cursor'."\0".$m[1],$config['hmac_secret'],true);$given=base64url_decode($m[2]);$json=base64url_decode($m[1]);if($given===false||$json===false||!hash_equals($expected,$given))error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',['cursor'=>['유효하지 않은 cursor입니다.']]);try{$data=json_decode($json,true,4,JSON_THROW_ON_ERROR);}catch(JsonException $e){$data=null;}if(!is_array($data)||!isset($data['createdAt'],$data['id'])||!is_string($data['createdAt'])||!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/',$data['createdAt'])||!is_string($data['id'])||!preg_match('/^[1-9][0-9]*$/',$data['id']))error_response(422,'VALIDATION_FAILED','입력값을 확인해주세요.',['cursor'=>['유효하지 않은 cursor입니다.']]);return $data;}
