export default function ImageBlock({ image, alt }) {
  if (!image) {
    return null;
  }

  return (
    <figure className="image-block">
      <img src={image} alt={alt} />
    </figure>
  );
}
