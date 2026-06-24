const API_KEY = "fff2dc0e3f05666054e8f3ad8015c085";

const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");

const results = document.getElementById("results");
const loading = document.getElementById("loading");

const modal = document.getElementById("movieModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalYear = document.getElementById("modalYear");
const modalGenre = document.getElementById("modalGenre");
const modalDescription = document.getElementById("modalDescription");
const trailerContainer = document.getElementById("trailerContainer");

const closeBtn = document.querySelector(".close");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageNo = document.getElementById("pageNo");


let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currPage = 1;
let totalPages = 1;
let fetchedMovies = [];
let isSearching = false;

function showError() {
    results.innerHTML = `
        <h3>Something went wrong</h3>
    `;
}

function showNoMovies() {
    results.innerHTML = `
        <h3 style="color:#331E38">No Movies Found</h3>
    `;
}

function updatePaginationButtons() {
    if (isSearching) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    prevBtn.disabled = currPage === 1;
    nextBtn.disabled = currPage >= totalPages;
}

async function getMovieTrailer(id) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
        );

        const data = await response.json();

        const trailer = data.results.find(
            video =>
                video.type === "Trailer" &&
                video.site === "YouTube"
        );

        if (trailer) {
            trailerContainer.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${trailer.key}"
                    allowfullscreen>
                </iframe>
            `;
        } else {
            trailerContainer.innerHTML = `
                <p>No trailer available</p>
            `;
        }

    } catch (error) {
        trailerContainer.innerHTML = `
            <p>Unable to load trailer</p>
        `;
        console.log(error);
    }
}

async function getMovieDetails(id) {

    trailerContainer.innerHTML = "";

    try {

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
        );

        const data = await response.json();

        modalPoster.src =
            `https://image.tmdb.org/t/p/w500${data.poster_path}`;

        modalTitle.textContent = data.title;

        modalYear.textContent =
            `Release Date: ${data.release_date}`;

        modalGenre.textContent =
            `Genres: ${data.genres.map(g => g.name).join(", ")}`;

        modalDescription.textContent =
            data.overview;

        modal.style.display = "flex";

        await getMovieTrailer(id);

    } catch (error) {
        console.log(error);
        showError();
    }
}

function toggleFavorites(movie, btn) {

    const exists =
        favorites.some(fav => fav.id === movie.id);

    if (exists) {
        favorites =
            favorites.filter(
                fav => fav.id !== movie.id
            );

        btn.classList.remove("active");
    } else {
        favorites.push(movie);
        btn.classList.add("active");
    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
}

function displayMovies(movieList) {

    results.innerHTML = "";

    movieList.forEach(movie => {

        const isFavorite =
            favorites.some(
                fav => fav.id === movie.id
            );

        const year =
            movie.release_date
                ? movie.release_date.slice(0, 4)
                : "N/A";

        results.innerHTML += `
            <div class="movie-card">

                <button class="watch-btn ${isFavorite ? "active" : ""}">
                    &hearts;
                </button>

                <img src="${
                    movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }">

                <div class="movie-info">

                    <div>
                        <h3>${movie.title}</h3>
                        <p>${year}</p>
                    </div>

                    <div class="rating">
                        ★
                        <span>${movie.vote_average.toFixed(1)}</span>
                    </div>

                </div>

            </div>
        `;
    });

    const cards =
        document.querySelectorAll(".movie-card");

    const watchBtns =
        document.querySelectorAll(".watch-btn");

    watchBtns.forEach((btn, index) => {

        btn.addEventListener("click", e => {

            e.stopPropagation();

            toggleFavorites(
                movieList[index],
                btn
            );
        });
    });

    cards.forEach((card, index) => {

        card.addEventListener("click", () => {
            getMovieDetails(movieList[index].id);
        });
    });
}

async function loadMovies() {

    loading.style.display = "flex";

    try {

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${currPage}`
        );

        const data = await response.json();

        totalPages = data.total_pages;

        fetchedMovies = data.results;

        displayMovies(fetchedMovies);

        updatePaginationButtons();

    } catch (error) {

        console.log(error);
        showError();

    } finally {

        loading.style.display = "none";
    }
}

async function searchMovies(query) {

    loading.style.display = "flex";

    try {

        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
        );

        const data = await response.json();

        if (data.results.length === 0) {
            showNoMovies();
            return;
        }

        displayMovies(data.results);

    } catch (error) {

        console.log(error);
        showError();

    } finally {

        loading.style.display = "none";
    }
}

loadMovies();

nextBtn.addEventListener("click", () => {

    if (currPage < totalPages) {
        currPage++;
        pageNo.textContent = currPage;
        loadMovies();
    }
});

prevBtn.addEventListener("click", () => {

    if (currPage > 1) {
        currPage--;
        pageNo.textContent = currPage;
        loadMovies();
    }
});

let timer;

searchInput.addEventListener("input", () => {

    clearTimeout(timer);

    const searchTerm =
        searchInput.value.trim();

    timer = setTimeout(() => {

        if (searchTerm === "") {

            isSearching = false;

            displayMovies(fetchedMovies);

            updatePaginationButtons();

            return;
        }

        isSearching = true;

        updatePaginationButtons();

        searchMovies(searchTerm);

    }, 500);
});

searchInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        const term =
            searchInput.value.trim();

        if (term !== "") {
            isSearching = true;
            updatePaginationButtons();
            searchMovies(term);
        }
    }
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

document.addEventListener("keydown", e => {
    if (
        e.key === "Escape" &&
        modal.style.display === "flex"
    ) {
        modal.style.display = "none";
    }
});

let theme = localStorage.getItem("theme");

if (theme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem(
            "theme",
            "dark"
        );

        themeBtn.textContent = "☀️";

    } else {

        localStorage.setItem(
            "theme",
            "light"
        );

        themeBtn.textContent = "🌙";
    }
});
