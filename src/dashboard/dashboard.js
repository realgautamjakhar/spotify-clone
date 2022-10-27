import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

const onProfileClick = (event) => {
  event.stopPropagation();
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("#logout-btn").addEventListener("click", logout);
  }
};

const loadUserProfile = async () => {
  const defaultImg = document.querySelector("#default-img");
  const profileBtn = document.querySelector("#user-profile-btn");
  const displayNameElement = document.querySelector("#display-name");
  const userImg = document.querySelector(".user-img");
  const { display_name: displayName, images } = await fetchRequest(
    ENDPOINT.userInfo
  );
  
  displayNameElement.textContent = displayName;
  if (images?.length) {
    defaultImg.classList.add("hidden");
    const imagesUrl = images[0].url;
    console.log(imagesUrl);
    userImg.innerHTML = `<img src="${imagesUrl}" class="h-6 w-6 object-cover rounded-full" /> `;
  } else {
    defaultImg.classList.remove("hidden");
  }
  profileBtn.addEventListener("click", onProfileClick);
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
      "rounded-xl w-[200px] p-2 hover:cursor-pointer bg-black-secondary hover:bg-light-black mt-4 shadow-md";
    playlistItem.id = id;
    playlistItem.setAttribute("title", `${name}`);
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClicked(event, id)
    );
    const [{ url: imageurl }] = images;
    playlistItem.innerHTML = `<img src="${imageurl}" alt="${name}" class=" rounded-md object-contain ">
                                    <h2 class="text-base truncate font-bold my-2 text-primary">${name}</h2>
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
  let innerHTML = "";
  for (let [type, id] of playlistMap) {
    innerHTML += `<article class="p-4  ">
        <h1 class="text-2xl font-bold capitalize">${type}</h1>
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

const onTrackSelection = (event,id) => {
    document.querySelectorAll("#tracks .track").forEach(trackitem => {
        console.log(trackitem);
        if(trackitem.id == id){
            console.log("mathced");
            trackitem.classList.add("bg-gray","selected")
        }else{
            trackitem.classList.remove("bg-gray","selected")
        }
    })
}

const loadPlaylistTracks = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  let trackNo = 1;
  for (let trackitem of tracks.items) {
    let { id, artists, name, album, duration_ms: duration } = trackitem.track;
    let track = document.createElement("section");
    track.className =
      "track grid grid-cols-[50px_2fr_1fr_50px] hover:bg-black-secondary py-2 items-center m-2 rounded-md";
    let image = album.images.find((img) => img.height === 64);
    track.id = id;
    track.innerHTML = `
            <p class=" relative w-full flex justify-self-center place-content-center "><span class="track-no" >${trackNo++}</span></p>
              <section class="flex items-center gap-2">
                <img class="h-8 w-8" src="${image.url}" alt="${name}">
                <article>
                  <h2 class="text-base font-bold text-primary line-clamp-1">${name}</h2>
                  <p class="text-sm text-secondary line-clamp-1 ">${Array.from(
                    artists,
                    (artist) => artist.name
                  ).join(", ")}</p>
                </article>
              </section>
              <p class=" text-sm line-clamp-1 " >${album.name}</p>
              <p>${formatTime(duration)}</p>
        `;
    
    const playBtn = document.createElement("button")
    playBtn.id = `play-track${id}`;
    playBtn.className =" absolute play w-full text-lg invisible left-[0px]";
    playBtn.innerHTML = "▶️";
    track.querySelector("p").appendChild(playBtn)
    track.addEventListener("click",(event)=> onTrackSelection(event,id))
    playBtn.addEventListener("click",(event) => onPlayTrack(event, {}))
    trackSection.appendChild(track);
  }
};

const fillContentForPlatlist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const pageContentElement = document.querySelector("#page-content");
  pageContentElement.innerHTML = `<header>
            <nav>
            <ul class="grid grid-cols-[50px_2fr_1fr_50px] py-4 px-4 ">
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
  console.log(playlist);
  loadPlaylistTracks(playlist);
};

const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadplaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    fillContentForPlatlist(section.playlistId);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
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

  document.querySelector(".content").addEventListener("scroll", (event) => {
    const { scrollTop } = event.target;
    const header = document.querySelector(".header");
    if (scrollTop >= header.offsetHeight) {
      header.classList.add("sticky", "top-0", "bg-black-secondary");
      header.classList.remove("bg-transparent");
    } else {
      header.classList.remove("sticky", "top-0", "bg-black-secondary");
      header.classList.add("bg-transparent");
    }
  });
  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
