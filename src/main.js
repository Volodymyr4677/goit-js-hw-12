// main.js
import { fetchImages } from './js/pixabay-api.js';
import { renderImages, clearGallery } from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const loadMoreButton = document.createElement('button');
const loader = document.querySelector('.loader');
let query = '';
let page = 1;
let totalHits = 0;

loadMoreButton.textContent = 'Load more';
loadMoreButton.classList.add('load-more-button', 'hidden');
document.body.appendChild(loadMoreButton);

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = form.elements.query.value.trim();

  if (query === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  page = 1;
  clearGallery();
  loadMoreButton.classList.add('hidden');
  loader.classList.remove('hidden');

  try {
    const data = await fetchImages(query, page);
    totalHits = data.totalHits;

    if (data.hits.length > 0) {
      renderImages(data.hits);
      if (data.hits.length < totalHits)
        loadMoreButton.classList.remove('hidden');
    } else {
      iziToast.error({
        title: 'Error',
        message: 'No images found. Please try a different query.',
        position: 'topRight',
      });
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  loader.classList.remove('hidden');

  try {
    const data = await fetchImages(query, page);
    renderImages(data.hits);

    if ((page - 1) * 15 + data.hits.length >= totalHits) {
      loadMoreButton.classList.add('hidden');
      iziToast.info({
        title: 'End of Results',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    scrollPage();
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch more images.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});

function scrollPage() {
  const gallery = document.querySelector('.gallery');
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}
