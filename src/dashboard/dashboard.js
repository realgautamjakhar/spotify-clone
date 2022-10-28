import { fetchRequest } from "../api";
import {
  ENDPOINT,
  getItemFromLocalStorage,
  LOADED_TRACKS,
  logout,
  SECTIONTYPE,
  setItemInLocalStorage,
} from "../common";

const audio = new Audio();
let displayName;
var userImageUrl;

const onProfileClick = (event) => {
  event.stopPropagation();
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("#logout-btn").addEventListener("click", logout);
  }
};

const loadUserProfile = () => {
  return new Promise(async(resolve,reject)=>{
    const defaultImg = document.querySelector("#default-img");
    const profileBtn = document.querySelector("#user-profile-btn");
    const displayNameElement = document.querySelector("#display-name");
    const userImg = document.querySelector(".user-img");
    
    const { display_name: displayName, images } = await fetchRequest(
      ENDPOINT.userInfo
    );
    displayNameElement.textContent = displayName;
    let userImageUrl;
    if (images?.length) {
      defaultImg.classList.add("hidden");
      const imagesUrl = images[0].url;
      userImageUrl = images[0].url;
      userImg.innerHTML = `<img src="${imagesUrl}" class="h-6 w-6 object-cover rounded-full" /> `;
    } else {
      defaultImg.classList.remove("hidden");
    }
    console.log(userImageUrl);
    profileBtn.addEventListener("click", onProfileClick);
    resolve({displayName,userImageUrl})
  })
  
};

const onPlaylistItemClicked = (event, id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlistId: id };
  history.pushState(section, "", `playlist/${id}`);
  loadSection(section);
};

const loadplaylist = async (endpoint, elementid) => {
  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const playlistItemSection = document.querySelector(`#${elementid}`);
  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.className =
      "rounded-md w-[200px] hover:cursor-pointer bg-black-secondary hover:bg-light-black p-3 shadow-md ";
    playlistItem.id = id;
    playlistItem.setAttribute("title", `${name}`);
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClicked(event, id)
    );
    const [{ url: imageurl }] = images;
    playlistItem.innerHTML = `<img src="${imageurl}" alt="${name}" class=" rounded-sm object-contain drop-shadow-xl">
                                    <h2 class="text-base font-semibold truncate my-2 text-primary">${name}</h2>
                                    <h3 class="text-xs line-clamp-2 text-secondary " >${description}</h3>
                                    `;
    playlistItemSection.appendChild(playlistItem);
  }
};

const loadplaylists = () => {
  loadplaylist(ENDPOINT.featuredPlaylist, "featured-playlist");
  loadplaylist(ENDPOINT.toplists, "top-playlist");
};

const fillContentForDashboard = () => {
  const playlistMap = new Map([
    ["featured", "featured-playlist"],
    ["toplist", "top-playlist"],
  ]);
  const pageContentElement = document.querySelector("#page-content");
  const coverElement = document.querySelector("#cover-content");
  coverElement.className = ("absolute text-6xl grid content-center w-full h-[400px] -z-[1] top-0 px-8 py-4 bg-gradient-to-b from-light-black to-black-base")
  if(coverElement.getAttribute("style")){
    coverElement.removeAttribute("style")
  }
  console.log(userImageUrl);
  coverElement.innerHTML = ` 
  <section class="flex items-center gap-4">
  <img class="w-[200px] h-[200px] rounded-full object-cover shadow-2xl" src="${userImageUrl?? "../assets/spotify-icon-green-logo-8.png"}" alt="">
  <section>
    <h4 class="text-base">Hello</h4>
    <h2 class="text-4xl ">${displayName}</h2>
  </section>
  </section>
  `;
  let innerHTML = "";

  for (let [type, id] of playlistMap) {
    innerHTML += `<article class="p-4">
        <h1 class="text-2xl font-bold capitalize mb-4">${type}</h1>
        <section class="featured-songs scrollbarhidden grid gap-4 grid-flow-col overflow-scroll grid-cols-auto-fill-card" id="${id}">
        </section>
        </article>`;
  }
  pageContentElement.innerHTML = innerHTML;
};

//Format Time into MINs
const formatTime = (duration) => {
  const min = Math.floor(duration / 60000);
  const sec = ((duration % 6000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};

const onTrackSelection = (event, id) => {
  document.querySelectorAll("#tracks .track").forEach((trackitem) => {
    if (trackitem.id == id) {
      trackitem.classList.add("bg-gray", "selected");
    } else {
      trackitem.classList.remove("bg-gray", "selected");
    }
  });
};



const updateIconsForPlayMode = (id) => {
  const playBtn = document.querySelector("#play");
  playBtn.querySelector("span").textContent = "pause_circle";
  const playBtnFromTracks = document.querySelector(`#play-track-${id}`);
  if (playBtnFromTracks) {
    playBtnFromTracks.textContent = "pause";
  }
};
const onAudioMetaDataLoaded = (id) => {
  const totalSongDuration = document.querySelector("#total-song-duration");
  totalSongDuration.innerHTML = `0:${audio.duration.toFixed(0)}`;
};
const updateIconsForPauseMode = (id) => {
  const playBtn = document.querySelector("#play");
  playBtn.querySelector("span").textContent = "play_circle";
  const playBtnFromTracks = document.querySelector(`#play-track-${id}`);
  if (playBtnFromTracks) {
    playBtnFromTracks.textContent = "play_arrow";
  }
};


const togglePlay = () => {
  if (audio.src) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
};

const findCurrentTrack = () => {
  const audioControl = document.querySelector("#audio-control");
  const trackId = audioControl.getAttribute("data-track-id");
  if (trackId) {
    const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
    const currentTrackIndex = loadedTracks?.findIndex(
      (track) => track.id === trackId
    );
    return { currentTrackIndex, tracks: loadedTracks };
  }
  return null;
};

// NEXT PREV Button functions

const playNextTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > -1 && currentTrackIndex < tracks.length - 1) {
    playTrack(null, tracks[currentTrackIndex + 1]);
  }
};
const playPrevTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > 0) {
    playTrack(null, tracks[currentTrackIndex - 1]);
  }
};

// Playing songs 

const playTrack = (
  event,
  { image, artistName, name, duration, previewUrl, id }
) => {
  if (event?.stopPropagation) {
    event.stopPropagation();
  }
  if (audio.src === previewUrl) {
    togglePlay();
  } else {
    const nowPlayingSongImage = document.querySelector("#now-playing-image");
    const nowPlayingSongName = document.querySelector("#now-playing-song");
    const nowPlayingSongArtist = document.querySelector("#now-playing-artists");
    const audioControl = document.querySelector("#audio-control");
    audioControl.setAttribute("data-track-id", id);

    nowPlayingSongImage.src = image.url;
    nowPlayingSongImage.className = ("h-[64px] w-[64px]");
    nowPlayingSongName.textContent = name;
    nowPlayingSongArtist.textContent = artistName;

    audio.src = previewUrl;

    audio.play();
  }
};

// Playlist tracks

const loadPlaylistTracks = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  let trackNo = 1;
  const loadedTracks = [];

  for (let trackitem of tracks.items.filter((item) => item.track.preview_url)) {
    let {
      id,
      artists,
      name,
      album,
      duration_ms: duration,
      preview_url: previewUrl,
    } = trackitem.track;
    let track = document.createElement("section");
    track.className ="track grid grid-cols-[50px_2fr_1fr_50px] hover:bg-black-secondary py-2 items-center m-2 rounded-md";
    let image = album.images.find((img) => img.height === 64);
    track.id = id;
    let artistName = Array.from(artists, (artist) => artist.name).join(", ");
    track.innerHTML = `
            <p class=" relative w-full flex justify-self-center place-content-center "><span class="track-no" >${trackNo++}</span></p>
              <section class="flex items-center gap-2">
                <img class="h-8 w-8" src="${image.url}" alt="${name}">
                <article>
                  <h2 class="song-title text-base font-bold text-primary line-clamp-1">${name}</h2>
                  <p class="text-sm text-secondary line-clamp-1 ">${artistName}</p>
                </article>
              </section>
              <p class=" text-sm line-clamp-1 " >${album.name}</p>
              <p>${formatTime(duration)}</p>
        `;

    const playBtn = document.createElement("button");
    playBtn.id = `play-track-${id}`;
    playBtn.className =
      " absolute play w-full text-lg invisible left-[0px] material-symbols-outlined";
    playBtn.innerHTML = "play_arrow";
    track.querySelector("p").appendChild(playBtn);
    track.addEventListener("click", (event) => onTrackSelection(event, id));
    playBtn.addEventListener("click", (event) =>
      playTrack(event, { image, artistName, name, duration, previewUrl, id })
    );
    trackSection.appendChild(track);
    loadedTracks.push({
      id,
      artistName,
      name,
      album,
      duration,
      previewUrl,
      image,
    });
  }
  setItemInLocalStorage(LOADED_TRACKS, loadedTracks);
};

const fillContentForPlatlist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const coverElement = document.querySelector("#cover-content");
  const { name, description, images } = playlist;
  coverElement.setAttribute(
    "style",
    `background-image:url(${images[0].url}); background-position: center ;background-repeat: no-repeat;background-size: cover;box-shadow: inset 0px 10px 100px 180px rgba(0,0,0,0.5);`
  );
  coverElement.innerHTML = `
                              <section class="flex items-center gap-4" >
                              <img class="max-h-[200px] max-w-[200px] drop-shadow-lg" src="${
                                images[0].url
                              }" alt="">
                              <section>
                              <p class="text-sm line-clamp-1" >Playlist</p>
                              <h2 id="playlist-name" class="text-8xl line-clamp-1">${
                                name ?? ""
                              }</h2>
                              <p class="text-sm text-secondary line-clamp-1" >${
                                description ?? ""
                              }</p>
                              <p class="text-xl line-clamp-1" >${
                                playlist.tracks.items.length ?? ""
                              } Songs</p>
                            </section>
                          `;
  const pageContentElement = document.querySelector("#page-content");
  pageContentElement.innerHTML = `<header id="playlist-header" class="z-10" >
            <nav>
            <ul class="grid grid-cols-[50px_2fr_1fr_50px] py-4 px-4 border-b border-light-black">
                <li class=" justify-self-center ">#</li>
                <li>Title</li>
                <li>Album</li>
                <li>  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
              </li>
            </ul>
            </nav>
            </header>
            <section id="tracks" class=" m-2 " >
            </section>`;

  document.createElement("section");
  loadPlaylistTracks(playlist);
};

// Onscroll 

const onScroll = (e) => {
  const { scrollTop } = e.target;
  const header = document.querySelector(".header");
  const coverElement = document.querySelector("#cover-content");
  const totalHeigth = coverElement.offsetHeight;
  const coverOpacity =
    100 - (scrollTop >= totalHeigth ? 100 : (scrollTop / totalHeigth) * 100);
  const headerOpacity =
    scrollTop >= coverElement.offsetHeight
      ? 100
      : (scrollTop / coverElement.offsetHeight) * 100;
  coverElement.style.opacity = `${coverOpacity}%`;
  header.style.background = `rgba(0 0 0 /${headerOpacity}%)`;

  if (history.state.type === SECTIONTYPE.PLAYLIST) {
    const playlistHeader = document.querySelector("#playlist-header");
    if (coverOpacity <= 35) {
      playlistHeader.classList.add("sticky", "bg-black-secondary");
      playlistHeader.style.top = `${header.offsetHeight - 1}px `;
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary");
      playlistHeader.style.top = `revert`;
    }
  }
};

//Load Section to track which page you are on and change contain based on that

const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadplaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {

    fillContentForPlatlist(section.playlistId);
  } else if (section.type === SECTIONTYPE.SEARCH){
    searchScreen();
  }
};

//Sidenav UserprofilePlaylist Functions

const onUserPlaylistClicked = (id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlistId: id };
  history.pushState(section, "", `/dashboard/playlist/${id}`);
  loadSection(section);
};

const loadUserPlaylists = async () => {
  const playlists = await fetchRequest(ENDPOINT.userPlaylist);
  const userPlaylistSection = document.querySelector("#user-playlist > ul");
  userPlaylistSection.innerHTML = ``;
  for (let { name, id } of playlists.items) {
    const li = document.createElement("li");
    li.textContent = name;
    li.className = "cursor-pointer hover:text-primary";
    li.addEventListener("click", () => onUserPlaylistClicked(id));
    userPlaylistSection.appendChild(li);
  }
};


// Search Function

const searchReq = async (searchValue) =>{
  const query = searchValue;
  const searchResult = await fetchRequest(`${ENDPOINT.search}?q=${query}&type=track`)
  
  const searchTracks = document.querySelector("#search-tracks");


  for(let {id,
    artists,
    name,
    album,
    duration_ms: duration,
    preview_url: previewUrl,} of searchResult.tracks.items){
    const searchTrack = document.createElement("section");
    console.log(album.images);
    let image = album.images.find((img) => img.height === 300);
    searchTrack.className =  "track flex flex-col hover:bg-light-black py-2 items-center m-2 rounded-md bg-black-secondary w-[200] h-[200] p-2";
    console.log(name,id);
    searchTrack.id = id;
    let artistName = Array.from(artists, (artist) => artist.name).join(", ");
    searchTrack.innerHTML =`<p class=" relative w-200 flex justify-self-center place-content-center"></p>
                            <section class="flex flex-col items-center gap-2">
                            <img class="h-auto w-full" src="${image.url}" alt="${name}">
                            <h2 class="song-title text-base font-semibold text-primary line-clamp-1">${name} <span class="text-xs text-secondary">${formatTime(duration)}</span></h2>
                            <p class="text-xs text-secondary line-clamp-1 ">${artistName}</p>
                            </section>
                            <p class=" text-xs line-clamp-1 " >${album.name}</p>`
                            
    searchTracks.appendChild(searchTrack)

    searchTrack.addEventListener("click",(event)=>{
      console.log("play search track");
      console.log(event);
      playTrack(event, {image, name, duration, previewUrl, id });
    })
  }
}

const searchScreen = () =>{
  const coverElement = document.querySelector("#cover-content");
  coverElement.classList.add("z-20")
  coverElement.innerHTML = `
  <section class="m-auto w-full flex justify-center gap-4 p-4 z-20">
  <input type="search" placeholder="Search" id="search-input" class="text-white bg-light-black  w-full h-auto outline-none p-2 text-4xl rounded-md z-20">
    <button id="search-submit" type="submit" class="px-3 py-1 rounded-md h-auto  hover:text-green transition-all z-20" >Search</button>
  </section>
  
  `;
  const pageContentElement = document.querySelector("#page-content");
  pageContentElement.innerHTML = `<section id = "search-tracks" class="grid grid-cols-auto-fill-card h-auto "title="Play Song"> </section>`;
  const searchSubmit = document.querySelector("#search-submit")
  const searchInput = document.querySelector("#search-input")
  const searchTracks = document.querySelector("#search-tracks");
  
  searchSubmit.addEventListener("click",()=>{
    let searchValue = searchInput.value;
    searchTracks.innerHTML ="";
    console.log(searchValue);
    searchReq(searchValue)
  })
}

const onSearchBtnClicked = () =>{
  const section = {type:SECTIONTYPE.SEARCH}
  history.pushState(section,"","search")
  searchScreen()
}


document.addEventListener("DOMContentLoaded", async() => {
  const volume = document.querySelector("#volume");
  const playBtn = document.querySelector("#play");

  const SongDurationCompleted = document.querySelector(
    "#song-duration-completed"
  );
  const songProgress = document.querySelector("#progress");
  const timeline = document.querySelector("#timeline");
  const audioControl = document.querySelector("#audio-control");
  const next = document.querySelector("#next");
  const prev = document.querySelector("#prev");
  let progressInterval;

  ({displayName,userImageUrl} = await loadUserProfile());
  loadUserPlaylists();
  const section = { type: SECTIONTYPE.DASHBOARD };
  history.pushState(section, "", "");
  loadSection(section);
  fillContentForDashboard();
  loadplaylists();
  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });
  document.querySelector(".content").addEventListener("scroll", (e) => {
    onScroll(e);
  });

  audio.addEventListener("play", () => {
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    const tracks = document.querySelector("#tracks");
    const playingTrack = tracks?.querySelector("section.playing");
    const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
    if (playingTrack?.id !== selectedTrack?.id) {
      playingTrack?.classList.remove("playing");
    }
    selectedTrack?.classList.add("playing");
    progressInterval = setInterval(() => {
      if (audio.paused) {
        return;
      }
      SongDurationCompleted.textContent = `${
        audio.currentTime.toFixed(0) < 10
          ? "0:0" + audio.currentTime.toFixed(0)
          : "0:" + audio.currentTime.toFixed(0)
      }`;
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    }, 100);
    updateIconsForPlayMode(selectedTrackId);
  });
  audio.addEventListener("pause", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    updateIconsForPauseMode(selectedTrackId);
  });

  audio.addEventListener("loadedmetadata", onAudioMetaDataLoaded);
  playBtn.addEventListener("click", togglePlay);

  next.addEventListener("click", playNextTrack);
  prev.addEventListener("click", playPrevTrack);

  document.querySelector("#search-btn").addEventListener("click",onSearchBtnClicked)
  volume.addEventListener("click", () => {
    audio.volume = volume.value / 100;
  });

  timeline.addEventListener(
    "click",
    (e) => {
      const timelineWidth = window.getComputedStyle(timeline).width;
      const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
      audio.currentTime = timeToSeek;
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    },
    false
  );

  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
