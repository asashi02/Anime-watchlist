document.addEventListener('DOMContentLoaded', () => {
    const animeForm = document.getElementById('anime-form');
    const animeTitleInput = document.getElementById('anime-title');
    const animeStatusInput = document.getElementById('anime-status');
    const animeEpisodesInput = document.getElementById('anime-episodes');
    const animeRatingInput = document.getElementById('anime-rating');
    const animeGenreInput = document.getElementById('anime-genre');
    const animeLinkInput = document.getElementById('anime-link');
    const animeStartDateInput = document.getElementById('anime-start-date');
    const animeEndDateInput = document.getElementById('anime-end-date');
    const animeImageInput = document.getElementById('anime-image');

    const watchingList = document.getElementById('watching-list');
    const completedList = document.getElementById('completed-list');

    const searchInput = document.getElementById('search-input');
    const sortBySelect = document.getElementById('sort-by');

    let animeList = JSON.parse(localStorage.getItem('animeList')) || [];

    // --- Functions to manage and display anime ---

    function saveAnimeList() {
        localStorage.setItem('animeList', JSON.stringify(animeList));
    }

    function renderAnimeList(currentAnimeList = animeList) {
        watchingList.innerHTML = '';
        completedList.innerHTML = '';

        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortBySelect.value;

        let filteredAndSortedList = currentAnimeList.filter(anime =>
            anime.title.toLowerCase().includes(searchTerm)
        );

        // Sort the list
        filteredAndSortedList.sort((a, b) => {
            if (sortBy === 'title-asc') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'title-desc') {
                return b.title.localeCompare(a.title);
            } else if (sortBy === 'rating-desc') {
                return (b.rating || 0) - (a.rating || 0); // Handle potentially undefined ratings
            } else if (sortBy === 'rating-asc') {
                return (a.rating || 0) - (b.rating || 0);
            } else if (sortBy === 'start-date-desc') {
                return new Date(b.startDate) - new Date(a.startDate);
            } else if (sortBy === 'start-date-asc') {
                return new Date(a.startDate) - new Date(b.startDate);
            }
            return 0; // Default no sort
        });


        filteredAndSortedList.forEach(anime => {
            const animeCard = document.createElement('div');
            animeCard.classList.add('anime-card');
            animeCard.dataset.id = anime.id; // Store ID for editing/deleting

            const defaultImageUrl = 'https://via.placeholder.com/250x200?text=No+Image'; // Placeholder image

            animeCard.innerHTML = `
                <img src="${anime.image || defaultImageUrl}" alt="${anime.title} Poster">
                <h3>${anime.title}</h3>
                <p><strong>Status:</strong> ${anime.status}</p>
                <p><strong>Episodes:</strong> ${anime.episodes}</p>
                ${anime.rating ? `<p><strong>Rating:</strong> ${anime.rating}/10</p>` : ''}
                ${anime.genre ? `<p class="genre"><strong>Genre:</strong> ${anime.genre}</p>` : ''}
                ${anime.link ? `<p><a href="${anime.link}" target="_blank" class="link-button">Watch Now</a></p>` : ''}
                ${anime.startDate ? `<p><strong>Started:</strong> ${anime.startDate}</p>` : ''}
                ${anime.endDate && anime.status === 'Completed' ? `<p><strong>Finished:</strong> ${anime.endDate}</p>` : ''}
                <div class="actions">
                    <button class="edit" data-id="${anime.id}">Edit</button>
                    <button class="delete" data-id="${anime.id}">Delete</button>
                </div>
            `;

            if (anime.status === 'Watching' || anime.status === 'Plan to Watch' || anime.status === 'On Hold' || anime.status === 'Dropped') {
                watchingList.appendChild(animeCard);
            } else if (anime.status === 'Completed') {
                completedList.appendChild(animeCard);
            }
        });
    }

    // --- Event Listeners ---

    // Add new anime
    animeForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

        // Basic validation for dates
        const startDate = animeStartDateInput.value;
        const endDate = animeEndDateInput.value;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be before start date.");
            return;
        }

        const newAnime = {
            id: Date.now(), // Simple unique ID
            title: animeTitleInput.value,
            status: animeStatusInput.value,
            episodes: parseInt(animeEpisodesInput.value),
            rating: animeRatingInput.value ? parseInt(animeRatingInput.value) : null,
            genre: animeGenreInput.value,
            link: animeLinkInput.value,
            startDate: animeStartDateInput.value,
            endDate: animeEndDateInput.value,
            image: animeImageInput.value,
        };

        animeList.push(newAnime);
        saveAnimeList();
        renderAnimeList();
        animeForm.reset(); // Clear the form
    });

    // Edit and Delete handlers using event delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            const idToDelete = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this anime?')) {
                animeList = animeList.filter(anime => anime.id !== idToDelete);
                saveAnimeList();
                renderAnimeList();
            }
        }

        if (e.target.classList.contains('edit')) {
            const idToEdit = parseInt(e.target.dataset.id);
            const animeToEdit = animeList.find(anime => anime.id === idToEdit);

            if (animeToEdit) {
                // Populate the form with existing data
                animeTitleInput.value = animeToEdit.title;
                animeStatusInput.value = animeToEdit.status;
                animeEpisodesInput.value = animeToEdit.episodes;
                animeRatingInput.value = animeToEdit.rating || '';
                animeGenreInput.value = animeToEdit.genre || '';
                animeLinkInput.value = animeToEdit.link || '';
                animeStartDateInput.value = animeToEdit.startDate || '';
                animeEndDateInput.value = animeToEdit.endDate || '';
                animeImageInput.value = animeToEdit.image || '';

                // Change button to "Update" and add data-edit-id
                animeForm.querySelector('button[type="submit"]').textContent = 'Update Anime';
                animeForm.querySelector('button[type="submit"]').dataset.editId = idToEdit;
            }
        }
    });

    // Handle update logic when "Update Anime" button is clicked
    animeForm.addEventListener('submit', (e) => {
        const updateButton = animeForm.querySelector('button[type="submit"]');
        const editId = updateButton.dataset.editId;

        if (editId) { // If we are in edit mode
            e.preventDefault(); // Prevent default form submission

            // Basic validation for dates
            const startDate = animeStartDateInput.value;
            const endDate = animeEndDateInput.value;
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                alert("End date cannot be before start date.");
                return;
            }

            animeList = animeList.map(anime => {
                if (anime.id === parseInt(editId)) {
                    return {
                        id: anime.id, // Keep the same ID
                        title: animeTitleInput.value,
                        status: animeStatusInput.value,
                        episodes: parseInt(animeEpisodesInput.value),
                        rating: animeRatingInput.value ? parseInt(animeRatingInput.value) : null,
                        genre: animeGenreInput.value,
                        link: animeLinkInput.value,
                        startDate: animeStartDateInput.value,
                        endDate: animeEndDateInput.value,
                        image: animeImageInput.value,
                    };
                }
                return anime;
            });

            saveAnimeList();
            renderAnimeList();
            animeForm.reset(); // Clear the form
            updateButton.textContent = 'Add Anime'; // Change button back
            delete updateButton.dataset.editId; // Remove the edit ID
        }
        // If not in edit mode, the regular 'add' logic on initial submit listener will handle it.
        // We put this logic inside the submit listener itself so it fires after the default form submission.
    });


    // Search functionality
    searchInput.addEventListener('input', () => {
        renderAnimeList();
    });

    // Sort functionality
    sortBySelect.addEventListener('change', () => {
        renderAnimeList();
    });

    // Initial render when the page loads
    renderAnimeList();
});
