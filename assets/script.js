const apiKey = "b62f5300";
let debounceTimeout;
let currentPage = 1;
let currentQuery = "";
let movieDetail = []; // To store movie details globally

// Initial default search query
let defaultQuery = "Marvel";

document.addEventListener("DOMContentLoaded", () => {
  currentQuery = defaultQuery;
  searchMovies(currentQuery);
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    currentQuery = event.target.value.trim();
    currentPage = 1;
    if (currentQuery) {
      searchMovies(currentQuery, currentPage, true);
    } else {
      searchMovies(defaultQuery, currentPage, true); // Show default movies if query is empty
    }
  }, 300);
});

document.getElementById("showMoreButton").addEventListener("click", () => {
  currentPage++;
  searchMovies(currentQuery || defaultQuery, currentPage, false);
});

function searchMovies(query, page = 1, clearResults = true) {
  if (query.trim() === "") {
    // When query is empty, use the default query
    query = defaultQuery;
  }

  showLoadingSpinner(true);

  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      showLoadingSpinner(false);
      if (data.Response === "False") {
        displayMovies([], clearResults);
        toggleShowMoreButton(0, page);
        return;
      }

      movieDetail = data.Search.map((movie) => ({
        ...movie,
      }));

      displayMovies(movieDetail, clearResults);
      toggleShowMoreButton(data.totalResults, page);
    })
    .catch((error) => {
      showLoadingSpinner(false);
      console.error("Error fetching movie data:", error);
      displayMovies([], clearResults);
      toggleShowMoreButton(0, page);
    });
}

function displayMovies(movies, clearResults) {
  const container = document.getElementById("moviesContainer");
  if (clearResults) container.innerHTML = "";

  if (movies && movies.length > 0) {
    movies.forEach((movie) => {
      const movieCard = `
        <div class="movie-card transform transition-transform hover:scale-105 bg-gray-800 rounded-lg p-4 shadow-lg cursor-pointer">
            <img src="${movie.Poster}" onclick="fetchMovieDetails('${movie.imdbID}')" alt="${movie.Title}" class="w-full h-60 object-cover rounded-lg mb-4">
            <h2 class="text-lg font-bold mb-2">${movie.Title} <span class="text-gray-400">(${movie.Year})</span></h2>
            <div class="mt-3 flex justify-between">
              <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded shadow-lg px-2 py-1">Watch</button>
            </div>
        </div>
      `;
      container.innerHTML += movieCard;
    });
  } else if (clearResults) {
    container.innerHTML =
      '<p class="text-center text-gray-400">No movies found</p>';
  }
}

function fetchMovieDetails(imdbID) {
  showLoadingSpinner(true);

  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
    .then((response) => response.json())
    .then((data) => {
      showLoadingSpinner(false);
      displayMovieDetails(data);
    })
    .catch((error) => {
      showLoadingSpinner(false);
      console.error("Error fetching movie details:", error);
    });
}

function displayMovieDetails(movie) {
  const movieDetailsContainer = document.getElementById(
    "movieDetailsContainer"
  );
  movieDetailsContainer.innerHTML = `
   <div class="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div class="flex flex-col md:flex-row">
        <img src="${movie.Poster}" alt="${movie.Title}" class="w-full md:w-1/3 object-cover rounded-lg mb-4 md:mb-0">
        <div class="md:ml-4">
          <h2 class="text-2xl font-bold mb-4">${movie.Title} <span class="text-gray-400">(${movie.Year})</span></h2>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Released:</strong> ${movie.Released}</p>
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Writer:</strong> ${movie.Writer}</p>
          <p><strong>Actors:</strong> ${movie.Actors}</p>
          <p><strong>Plot:</strong> <span class="text-gray-400">${movie.Plot}</span></p>
          <p class="flex items-center gap-1"><strong>IMDB Rating:</strong> 
            <span class="">${movie.imdbRating}/10</span>
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 72 72">
                    <path fill="#fcea2b" d="M35.993 10.736L27.791 27.37L9.439 30.044l13.285 12.94l-3.128 18.28l16.412-8.636l16.419 8.624l-3.142-18.278l13.276-12.95l-18.354-2.66z" />
                    <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M35.993 10.736L27.791 27.37L9.439 30.044l13.285 12.94l-3.128 18.28l16.412-8.636l16.419 8.624l-3.142-18.278l13.276-12.95l-18.354-2.66z" />
                </svg>
            </span>
          </p>
        </div>
        <button id="closeDetailsButton" class="w-16 h-10 text-center bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300 mt-4">Close</button>
      </div>
      
    </div>
  `;
  document.getElementById("moviesContainer").style.display = "none";
  movieDetailsContainer.style.display = "block";
  document.getElementById("showMoreButton").style.display = "none"; // Hide the Show More button

  document
    .getElementById("closeDetailsButton")
    .addEventListener("click", () => {
      movieDetailsContainer.style.display = "none";
      document.getElementById("moviesContainer").style.display = "grid";
      document.getElementById("showMoreButton").style.display = "block"; // Show the Show More button again
    });
}

function toggleShowMoreButton(totalResults, currentPage) {
  const showMoreButton = document.getElementById("showMoreButton");
  const totalPages = Math.ceil(totalResults / 10); // Assuming 10 results per page
  if (currentPage < totalPages) {
    showMoreButton.style.display = "block";
  } else {
    showMoreButton.style.display = "none";
  }
}

function showLoadingSpinner(show) {
  const spinner = document.getElementById("loadingSpinner");
  if (show) {
    spinner.style.display = "block";
  } else {
    spinner.style.display = "none";
  }
}
