import { useState } from 'react'

export default function FlipAlbum({ images, altPrefix, dark = false }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState('next')
  const go = (step) => {
    setDirection(step > 0 ? 'next' : 'prev')
    setIndex((current) => (current + step + images.length) % images.length)
  }
  return <div className={`album ${dark ? 'album-dark' : ''}`}>
    <div className="album-stage">
      <div className="album-card album-card-back album-card-back-two" aria-hidden="true" />
      <div className="album-card album-card-back" aria-hidden="true" />
      <button className={`album-card album-current flip-${direction}`} key={index} onClick={() => go(1)} aria-label={`View next image. Currently image ${index + 1} of ${images.length}`}>
        <img src={images[index]} alt={`${altPrefix} ${index + 1}`} loading="lazy" />
        <span className="album-click">Click image to flip <b>↗</b></span>
      </button>
    </div>
    <div className="album-controls">
      <button onClick={() => go(-1)} aria-label="Previous image">←</button>
      <span><b>{String(index + 1).padStart(2, '0')}</b> / {String(images.length).padStart(2, '0')}</span>
      <div className="album-progress"><i style={{ width: `${((index + 1) / images.length) * 100}%` }} /></div>
      <button onClick={() => go(1)} aria-label="Next image">→</button>
    </div>
    <div className="album-thumbs" aria-label="Album thumbnails">{images.map((image, imageIndex) => <button key={image} className={imageIndex === index ? 'active' : ''} onClick={() => { setDirection(imageIndex > index ? 'next' : 'prev'); setIndex(imageIndex) }} aria-label={`Show image ${imageIndex + 1}`}><img src={image} alt="" loading="lazy" /></button>)}</div>
  </div>
}
