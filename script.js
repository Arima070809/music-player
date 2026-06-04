//Select Elements
const audio = document.getElementById("audio");

const songPicker = document.getElementById("songPicker");
const playlist = document.getElementById("playlist");

const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const progress = document.getElementById("progress");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");

const search = document.getElementById("search");
const favoriteBtn = document.getElementById("favoriteBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const themeBtn = document.getElementById("themeBtn");   

const cover = document.getElementById("cover");
const volumeIcon = document.getElementById("volumeIcon");

const miniCover = document.getElementById("miniCover");
const miniTitle = document.getElementById("miniTitle");


let songs = [];
let favorites = [];
let currentSongIndex = 0;
let shuffleMode = false;
let repeatMode = false;

audio.volume = volume.value;


//Theme 
const savedTheme =
    localStorage.getItem("theme");

if(savedTheme === "light"){
    document.body.classList.add("light");
}


//Upload Songs
songPicker.addEventListener("change", event => {

    const newSongs = [...event.target.files];
    newSongs.forEach(song => {
        const exists = songs.some(
            existing => existing.name === song.name
        );
        if(!exists){
            songs.push(song);
        }
    });
    displayPlaylist();
    songPicker.value = "";
});


//Load Favorites
favorites =
JSON.parse(localStorage.getItem("favorites")) || [];


//Search Bar
search.addEventListener("input", () => {
    const searchTerm =
        search.value.toLowerCase();
    const items =
        playlist.querySelectorAll("li");
    items.forEach(item => {
        const songName =
            item.textContent.toLowerCase();
        item.style.display =
            songName.includes(searchTerm)
            ? ""
            : "none";
    });
});


//Display Playlist
function displayPlaylist(){
    playlist.innerHTML = "";
    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.textContent = song.name;
        li.dataset.index = index;
        li.addEventListener("click", () => {
            loadSong(index);
        });
        playlist.appendChild(li);
    });
    document.getElementById("stats")
        .textContent = `Songs: ${songs.length}`;
}


//Progress Bar for Song
audio.addEventListener("timeupdate", () => {
    const progressPercent =
        (audio.currentTime / audio.duration) * 100;
    progress.value = progressPercent || 0;
    currentTime.textContent =
        formatTime(audio.currentTime);
    duration.textContent =
        formatTime(audio.duration);
});


//Time Display
function formatTime(seconds){
    if(isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2,"0")}`;
}

//Song Time Skip
progress.addEventListener("input", () => {
    audio.currentTime =
        (progress.value / 100) * audio.duration;
}); 


//Load Song
function loadSong(index){
    currentSongIndex = index;
    const song = songs[index];

    audio.src = URL.createObjectURL(song);

    songTitle.textContent =
        song.name.replace(/\.[^/.]+$/, "");
    miniTitle.textContent =
        song.name.replace(/\.[^/.]+$/, "");
    
    artist.textContent = "Loading...";
    cover.src = "images/default-artwork.png";
    jsmediatags.read(song, {
    onSuccess: function(tag) {
        const tags = tag.tags;
        songTitle.textContent =
            tags.title ||
            song.name.replace(/\.[^/.]+$/, "");
        artist.textContent =
            tags.artist || "Unknown Artist";
        if(tags.picture){
            const picture = tags.picture;
            let base64String = "";
            for(let i = 0; i < picture.data.length; i++){
                base64String +=
                    String.fromCharCode(
                        picture.data[i]
                    );
            }
            const imageUrl =
                `data:${picture.format};base64,${
                    window.btoa(base64String)
                }`;
            cover.src = imageUrl;
            miniCover.src = imageUrl;
        }
        else{
            cover.src = "images/default-artwork.png";
            miniCover.src = "images/default-artwork.png";
        }
    },

        onError: function(error) {
            console.log(error);
            artist.textContent = "Unknown Artist";
            cover.src = "images/default-artwork.png";
            miniCover.src = "images/default-artwork.png";
        }
    });
    audio.play();
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    favoriteBtn.style.color =favorites.includes(song.name)
    ? "red"
    : "white";
    document.querySelectorAll("#playlist li").forEach(li => {
        li.classList.remove("active-song");
        if(Number(li.dataset.index) === index){
            li.classList.add("active-song");
        }
    });
}


//Drag and Drop songs
document.addEventListener("dragover", event => {
    event.preventDefault();
});
document.addEventListener("drop", event => {
    event.preventDefault();
    const files = [...event.dataTransfer.files];
    files.forEach(file => {

    if(!file.type.startsWith("audio/")) return;
        const exists = songs.some(
            song => song.name === file.name
        );
        if(!exists){
            songs.push(file);
        }
    });
    displayPlaylist();
});


//Autoplay next song
audio.addEventListener("ended", () => {
    if(repeatMode){
        audio.currentTime = 0;
        audio.play();
    }
    else{
        nextBtn.click();
    }
});


//Favourites button
favoriteBtn.addEventListener("click", () => {
    if(songs.length === 0) return;
    const currentSong =
        songs[currentSongIndex].name;
    const index =
        favorites.indexOf(currentSong);
    if(index === -1){
        favorites.push(currentSong);
        favoriteBtn.style.color = "red";
    }
    else{
        favorites.splice(index,1);
        favoriteBtn.style.color = "white";
    }

    //SAVE Favorites
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
});


//Shuffle Mode
shuffleBtn.addEventListener("click", () => {
    shuffleMode = !shuffleMode;
    shuffleBtn.style.color =
        shuffleMode ? "lime" : "white";
});


//Repeat
repeatBtn.addEventListener("click", () => {
    repeatMode = !repeatMode;
    repeatBtn.style.color =
        repeatMode ? "lime" : "white";
});


//Play-Pause button
playBtn.addEventListener("click", () => {
    if(audio.src === "") return;

    if(audio.paused){
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
    else{
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
});


//Next Song
nextBtn.addEventListener("click", () => {
    if(songs.length === 0) return;
    if(shuffleMode){
        let randomIndex;
        do{
            randomIndex =
            Math.floor(Math.random() * songs.length);
        }
        while(
            songs.length > 1 &&
            randomIndex === currentSongIndex
        );
        currentSongIndex = randomIndex;

    }
    else{
        currentSongIndex++;
        if(currentSongIndex >= songs.length){
            currentSongIndex = 0;
        }
    }
    loadSong(currentSongIndex);
});


//Previous Song
prevBtn.addEventListener("click", () => {

    if(songs.length === 0) return;
    currentSongIndex--;
    if(currentSongIndex < 0){
        currentSongIndex = songs.length - 1;
    }
    loadSong(currentSongIndex);
});


//Keyboard shortcuts for play/pause,next,prev
document.addEventListener("keydown", event => {
    if(document.activeElement === search){
        return;
    }
    if(event.code === "Space"){
        event.preventDefault();
        playBtn.click();
    }
    if(event.code === "ArrowRight"){
        nextBtn.click();
    }
    if(event.code === "ArrowLeft"){
        prevBtn.click();
     }
});


//Volume Control
volume.addEventListener("input", () => {
    audio.volume = volume.value;
    if(volume.value == 0){
        volumeIcon.textContent = "🔇";
    }
    else if(volume.value < 0.5){
        volumeIcon.textContent = "🔉";
    }
    else{
        volumeIcon.textContent = "🔊";
    }
});


//Theme Change
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );
});