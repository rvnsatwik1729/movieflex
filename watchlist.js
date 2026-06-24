const watchlistResults = document.getElementById("watchlistResults");
const emptyMessage = document.getElementById("emptyMessage");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function updateEmptyState() {
    if (favorites.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

function removeMovie(movieId) {
    favorites = favorites.filter(movie => movie.id !== movieId);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    displayWatchlistMovies();
}

function displayWatchlistMovies() {

    watchlistResults.innerHTML = "";

    updateEmptyState();

    if (favorites.length === 0) {
        return;
    }

    favorites.forEach(movie => {

        const year = movie.release_date
            ? movie.release_date.slice(0, 4)
            : "N/A";

        watchlistResults.innerHTML += `
            <div class="movie-card">

                <button
                    class="delete-btn"
                    data-id="${movie.id}">
                    🗑️
                </button>

                <img
                    src="${
                        movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/500x750?text=No+Image"
                    }"
                    alt="${movie.title}"
                >

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

    addDeleteEvents();
}

function addDeleteEvents() {

    const deleteButtons =
        document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(button => {

        button.addEventListener("click", () => {

            const movieId =
                Number(button.dataset.id);

            removeMovie(movieId);
        });
    });
}

displayWatchlistMovies();
