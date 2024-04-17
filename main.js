import './style.css'

const date = new Date()
const dateString = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

async function setupCounter () {
  const response = await fetch('counter.json')
  const counter = await response.json()
  document.querySelector('#counter').innerHTML = `Today, ${dateString}, there are ${counter.visiblePixels} visible pixels out of 20000`
}

async function setupPicture () {
  const response = await fetch('/.netlify/functions/picture')
  const blob = await response.blob()
  const objectURL = URL.createObjectURL(blob)
  document.querySelector('#picture').src = objectURL
}

setupCounter()
setupPicture()
