import './style.css'

const counterEl = document.querySelector('#counter')
const pictureEl = document.querySelector('#picture')
const aboutLinkEl = document.querySelector('#about-link a')
const aboutEl = document.querySelector('#about')
const aboutContentEl = document.querySelector('#about .content')
const aboutCloseBtnEl = document.querySelector('#about-close-btn')

const date = new Date()
const dateString = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

async function setupCounter () {
  const response = await fetch('/api/counter')
  const counter = await response.json()
  counterEl.innerHTML = `
    <span class="s1">Today is ${dateString}.</span>
    <span class="s2">There are ${counter.visiblePixels} visible pixels out of 20000.</span>
    <span class="s3">${counter.visiblePixels} is the number of days</span>
    <span class="s4">I have left to live.</span>
  `
  pictureEl.alt = `${counter.visiblePixels} visible pixels out of 20000`
}

async function setupPicture () {
  const response = await fetch('/api/picture')
  const blob = await response.blob()
  const objectURL = URL.createObjectURL(blob)
  pictureEl.src = objectURL
  pictureEl.onload = () => pictureEl.classList.add('done')
}

async function displayAbout (e) {
  e.preventDefault()
  const response = await fetch('about.html')
  const about = await response.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(about, 'text/html')
  aboutContentEl.replaceChildren()
  aboutContentEl.appendChild(doc.body.firstElementChild)
  aboutEl.classList.add('shown')
}

function closeAbout (e) {
  e.preventDefault()
  aboutEl.classList.remove('shown')
}

setupCounter()
setupPicture()
aboutLinkEl.addEventListener('click', displayAbout)
aboutCloseBtnEl.addEventListener('click', closeAbout)
