import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Search, Library, Plus, Heart, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, MoreHorizontal, Clock3, ListMusic,
  Headphones, Music2, Disc3, Radio, Menu, X, ExternalLink, Sparkles
} from 'lucide-react';
import './style.css';

const DEMO_TRACKS = [
  { id: 'demo-1', name: 'Night Drive', artist: 'Luna Bay', album: 'After Hours', duration: '3:24', color: 'plum', genre: 'Electronic', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'demo-2', name: 'Golden Hour', artist: 'The Paper Planes', album: 'Soft Focus', duration: '4:12', color: 'orange', genre: 'Indie', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'demo-3', name: 'Blue Skies', artist: 'Mira Sol', album: 'Open Windows', duration: '3:48', color: 'blue', genre: 'Chill', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'demo-4', name: 'Slow Motion', artist: 'Northbound', album: 'Small Moments', duration: '2:59', color: 'green', genre: 'Alternative', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'demo-5', name: 'Daydreaming', artist: 'June Atlas', album: 'Cloud Nine', duration: '3:36', color: 'pink', genre: 'Pop', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'demo-6', name: 'Somewhere Else', artist: 'Coastline', album: 'Elsewhere', duration: '4:05', color: 'gold', genre: 'Acoustic', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'demo-7', name: 'Midnight Bloom', artist: 'Velvet Echo', album: 'Night Garden', duration: '3:18', color: 'blue', genre: 'Electronic', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'demo-8', name: 'First Light', artist: 'Ari Vale', album: 'New Start', duration: '3:51', color: 'orange', genre: 'Indie', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
];

const playlistsSeed = [
  { id: 'made-for-you', name: 'Made for you', subtitle: 'Your daily mix', color: 'plum', trackIds: ['demo-1','demo-3','demo-5'] },
  { id: 'focus-flow', name: 'Focus Flow', subtitle: 'Stay in your zone', color: 'blue', trackIds: ['demo-3','demo-4','demo-6'] },
  { id: 'late-night', name: 'Late Night Vibes', subtitle: 'One more song', color: 'green', trackIds: ['demo-1','demo-7','demo-2'] },
  { id: 'good-energy', name: 'Good Energy', subtitle: 'A little brighter', color: 'orange', trackIds: ['demo-2','demo-5','demo-8'] }
];

function Cover({ color = 'plum', small = false, playing = false }) {
  return <div className={`cover cover-${color} ${small ? 'cover-small' : ''} ${playing ? 'cover-playing' : ''}`}>
    <div className="cover-orb orb-one" /><div className="cover-orb orb-two" />
    <div className="cover-lines" />
    <Music2 className="cover-glyph" size={small ? 18 : 28} strokeWidth={1.5} />
  </div>;
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function App() {
  const [tracks, setTracks] = useState(DEMO_TRACKS);
  const [currentId, setCurrentId] = useState('demo-1');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem('rm-liked') || '[]'));
  const [playlists, setPlaylists] = useState(() => JSON.parse(localStorage.getItem('rm-playlists') || 'null') || playlistsSeed);
  const [activeView, setActiveView] = useState('Home');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [notice, setNotice] = useState('');
  const [jamendoLoading, setJamendoLoading] = useState(false);
  const audioRef = useRef(null);
  const fileInput = useRef(null);
  const currentTrack = tracks.find(t => t.id === currentId) || tracks[0];

  useEffect(() => localStorage.setItem('rm-liked', JSON.stringify(liked)), [liked]);
  useEffect(() => localStorage.setItem('rm-playlists', JSON.stringify(playlists)), [playlists]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.audio || '';
    audio.load();
    setProgress(0);
    setDuration(0);
    if (playing) audio.play().catch(() => { setPlaying(false); setNotice('This track could not start. Try another track or check your connection.'); });
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, volume, muted]);

  useEffect(() => {
    const id = import.meta.env.VITE_JAMENDO_CLIENT_ID;
    if (!id) return;
    let ignore = false;
    setJamendoLoading(true);
    fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${encodeURIComponent(id)}&format=json&limit=20&audioformat=mp32&include=musicinfo`)
      .then(r => { if (!r.ok) throw new Error('Catalog request failed'); return r.json(); })
      .then(data => {
        if (ignore || !data.results?.length) return;
        const live = data.results.filter(t => t.audio).map((t, i) => ({
          id: `jamendo-${t.id}`, name: t.name, artist: t.artist_name, album: t.album_name || 'Jamendo',
          duration: formatTime(Number(t.duration)), color: ['plum','orange','blue','green','pink','gold'][i % 6],
          genre: t.musicinfo?.tags?.genres?.[0] || 'Independent', audio: t.audio, image: t.album_image,
          source: 'Jamendo', license: t.license_ccurl
        }));
        if (live.length) { setTracks([...live, ...DEMO_TRACKS]); setCurrentId(live[0].id); }
      })
      .catch(() => setNotice('Could not load the online catalog. Demo tracks remain available.'))
      .finally(() => !ignore && setJamendoLoading(false));
    return () => { ignore = true; };
  }, []);

  const visibleTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tracks;
    if (activeView === 'Liked Songs') list = tracks.filter(t => liked.includes(t.id));
    else if (activePlaylist) list = tracks.filter(t => activePlaylist.trackIds.includes(t.id));
    if (q && (activeView === 'Search' || searchOpen)) list = list.filter(t => `${t.name} ${t.artist} ${t.album} ${t.genre}`.toLowerCase().includes(q));
    return list;
  }, [tracks, query, activeView, searchOpen, activePlaylist, liked]);

  function chooseTrack(track, autoplay = true) {
    if (!track) return;
    if (track.id === currentId) { if (autoplay) setPlaying(true); return; }
    setCurrentId(track.id);
    setPlaying(autoplay);
    setNotice('');
  }
  function moveTrack(direction) {
    const list = visibleTracks.length ? visibleTracks : tracks;
    let index = list.findIndex(t => t.id === currentId);
    if (shuffle) index = Math.floor(Math.random() * list.length);
    else index = (index + direction + list.length) % list.length;
    chooseTrack(list[index]);
  }
  function toggleLike(id) { setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  function createPlaylist() {
    const name = window.prompt('Name your playlist');
    if (!name?.trim()) return;
    const item = { id: `playlist-${Date.now()}`, name: name.trim(), subtitle: 'Created by you', color: ['plum','blue','green','orange'][playlists.length % 4], trackIds: [] };
    setPlaylists(p => [...p, item]); setNotice(`Created “${item.name}”`);
  }
  function addCurrentToPlaylist(id) {
    setPlaylists(ps => ps.map(p => p.id === id ? {...p, trackIds: p.trackIds.includes(currentId) ? p.trackIds : [...p.trackIds, currentId]} : p));
    setNotice('Added to playlist');
  }
  function importAudio(e) {
    const list = Array.from(e.target.files || []);
    const imported = list.filter(f => f.type.startsWith('audio/')).map((f, i) => ({
      id: `local-${Date.now()}-${i}`, name: f.name.replace(/\.[^.]+$/, ''), artist: 'Your device', album: 'Local files',
      duration: '—', color: ['plum','blue','green','orange'][i % 4], genre: 'Local', audio: URL.createObjectURL(f), local: true
    }));
    if (imported.length) {
      setTracks(prev => [...imported, ...prev]);
      chooseTrack(imported[0]);
      setNotice(`${imported.length} local track${imported.length > 1 ? 's' : ''} added. Files stay on this device.`);
    }
    e.target.value = '';
  }
  const title = activePlaylist?.name || activeView;

  return <div className="app-shell">
    <audio ref={audioRef} onTimeUpdate={e => setProgress(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onEnded={() => repeat ? (audioRef.current.currentTime = 0, setPlaying(true)) : moveTrack(1)} />
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Headphones size={21}/></div><span>raman<span className="brand-light">music</span></span></div>
      <nav className="main-nav">
        <button className={activeView === 'Home' && !activePlaylist ? 'nav-item active' : 'nav-item'} onClick={() => {setActiveView('Home');setActivePlaylist(null);setSearchOpen(false)}}><Home size={20}/>Home</button>
        <button className={activeView === 'Search' ? 'nav-item active' : 'nav-item'} onClick={() => {setActiveView('Search');setActivePlaylist(null);setSearchOpen(true)}}><Search size={20}/>Search</button>
        <button className={activeView === 'Your Library' ? 'nav-item active' : 'nav-item'} onClick={() => {setActiveView('Your Library');setActivePlaylist(null);setSearchOpen(false)}}><Library size={20}/>Your Library</button>
      </nav>
      <div className="side-section">
        <div className="side-heading"><span>YOUR COLLECTION</span><button className="icon-button" title="Create playlist" onClick={createPlaylist}><Plus size={18}/></button></div>
        <button className="library-link" onClick={() => {setActiveView('Liked Songs');setActivePlaylist(null)}}><span className="liked-tile"><Heart size={17} fill="currentColor"/></span><span><b>Liked Songs</b><small>{liked.length} tracks</small></span></button>
        {playlists.map(p => <button className={`library-link ${activePlaylist?.id === p.id ? 'selected' : ''}`} key={p.id} onClick={() => {setActivePlaylist(p);setActiveView('Playlist')}}><Cover color={p.color} small/><span><b>{p.name}</b><small>{p.trackIds.length} songs · Playlist</small></span></button>)}
        <button className="library-link local-link" onClick={() => fileInput.current?.click()}><span className="local-tile"><Plus size={17}/></span><span><b>Import local music</b><small>Audio files from your PC</small></span></button>
        <input ref={fileInput} type="file" accept="audio/*" multiple hidden onChange={importAudio}/>
      </div>
      <div className="sidebar-bottom"><div className="mini-note"><Sparkles size={16}/><span>Find your next favourite.</span></div><small>Independent music experience</small></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="history-controls"><button className="circle-button" onClick={() => {setActiveView('Home');setActivePlaylist(null)}} aria-label="Go home">‹</button><button className="circle-button" onClick={() => {setActiveView('Search');setSearchOpen(true)}} aria-label="Search">›</button></div>
        <div className={`search-box ${activeView === 'Search' ? 'search-visible' : ''}`}><Search size={18}/><input value={query} onChange={e => {setQuery(e.target.value);if(e.target.value)setActiveView('Search')}} onFocus={() => setSearchOpen(true)} placeholder="What do you want to play?" aria-label="Search tracks"/></div>
        <div className="top-actions"><span className="status-pill"><span/> Free music</span><button className="profile" title="Local profile">R</button></div>
      </header>

      <div className="content-scroll">
        {activeView === 'Home' && !activePlaylist ? <>
          <section className="hero">
            <div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> YOUR SOUND, YOUR SPACE</div><h1>Music for<br/><span>every moment.</span></h1><p>Find a new favourite, get in the zone, or just press play.</p><button className="primary-button" onClick={() => {chooseTrack(tracks[0]);setPlaying(true)}}><Play size={18} fill="currentColor"/> Start listening</button></div>
            <div className="hero-art"><div className="hero-ring ring-a"/><div className="hero-ring ring-b"/><div className="hero-disc"><div className="disc-center"><Headphones size={43}/></div></div><div className="floating-note note-one">♫</div><div className="floating-note note-two">♪</div><div className="hero-caption">MADE FOR YOUR DAY</div></div>
          </section>
          <section className="section-block"><div className="section-title"><div><span className="kicker">A GOOD PLACE TO START</span><h2>Made for your mood</h2></div><button className="text-button" onClick={() => setActiveView('Your Library')}>View library <span>→</span></button></div>
            <div className="playlist-grid">{playlists.slice(0,4).map(p => <button className="playlist-card" key={p.id} onClick={() => {setActivePlaylist(p);setActiveView('Playlist')}}><div className="playlist-art"><Cover color={p.color}/><span className="card-play"><Play size={20} fill="currentColor"/></span></div><b>{p.name}</b><p>{p.subtitle}</p></button>)}</div>
          </section>
          <section className="section-block"><div className="section-title"><div><span className="kicker">FRESH PICKS</span><h2>Popular right now</h2></div><span className="subtle-label">{jamendoLoading ? 'Loading catalog…' : import.meta.env.VITE_JAMENDO_CLIENT_ID ? 'Online catalog + demos' : 'Demo tracks'}</span></div><TrackTable tracks={tracks.slice(0,6)} currentId={currentId} playing={playing} liked={liked} onPlay={chooseTrack} onLike={toggleLike} onAdd={addCurrentToPlaylist}/></section>
        </> : <>
          <section className={`page-banner ${activeView === 'Liked Songs' ? 'liked-banner' : ''}`}>
            <div className="banner-art">{activeView === 'Liked Songs' ? <Heart size={52} fill="currentColor"/> : activePlaylist ? <Cover color={activePlaylist.color}/> : activeView === 'Search' ? <Search size={54}/> : activeView === 'Your Library' ? <Library size={54}/> : <ListMusic size={54}/>}</div>
            <div className="banner-copy"><span className="kicker">{activeView === 'Search' ? 'DISCOVER SOMETHING NEW' : activeView === 'Liked Songs' ? 'YOUR COLLECTION' : activePlaylist ? 'PLAYLIST' : 'YOUR SPACE'}</span><h1>{title}</h1><p>{activePlaylist?.subtitle || (activeView === 'Search' ? 'Search by track, artist, album or genre.' : activeView === 'Liked Songs' ? `${liked.length} songs you saved for later` : activeView === 'Your Library' ? 'Your playlists and music, all in one place.' : 'Explore the music catalog.')}</p></div>
          </section>
          {activeView === 'Your Library' && !activePlaylist && <div className="library-actions"><button className="primary-button" onClick={createPlaylist}><Plus size={18}/> Create playlist</button><button className="secondary-button" onClick={() => fileInput.current?.click()}>Import audio files</button></div>}
          {activeView === 'Search' && <div className="genre-pills">{['All','Indie','Electronic','Chill','Pop','Alternative','Acoustic'].map(g => <button key={g} className={query === g ? 'genre-active' : ''} onClick={() => setQuery(g === 'All' ? '' : g)}>{g}</button>)}</div>}
          <section className="section-block results-block"><div className="section-title"><div><span className="kicker">{activeView === 'Search' ? 'RESULTS' : 'YOUR MUSIC'}</span><h2>{activeView === 'Search' ? (query ? `Results for “${query}”` : 'Browse tracks') : 'Tracks'}</h2></div><span className="subtle-label">{visibleTracks.length} tracks</span></div><TrackTable tracks={visibleTracks} currentId={currentId} playing={playing} liked={liked} onPlay={chooseTrack} onLike={toggleLike} onAdd={addCurrentToPlaylist}/>{visibleTracks.length === 0 && <div className="empty-state"><Disc3 size={36}/><b>Nothing here yet</b><p>Try another search or add a track to this playlist.</p></div>}</section>
        </>}
        <footer className="footer"><span>ramanmusic <span className="footer-dot">•</span> Made for listening</span><span>Demo audio is for testing. Music rights remain with their owners.</span></footer>
      </div>
    </main>

    <div className="player-bar">
      <div className="now-playing">{currentTrack && <><Cover color={currentTrack.color} small playing={playing}/><div className="now-text"><b title={currentTrack.name}>{currentTrack.name}</b><span>{currentTrack.artist}</span></div><button className={`like-button ${liked.includes(currentTrack.id) ? 'is-liked' : ''}`} title="Like track" onClick={() => toggleLike(currentTrack.id)}><Heart size={17} fill={liked.includes(currentTrack.id) ? 'currentColor' : 'none'}/></button><div className="add-menu"><button className="icon-button" title="Add to playlist" onClick={() => {if (playlists.length) addCurrentToPlaylist(playlists[0].id);else createPlaylist()}}><Plus size={17}/></button></div></>}</div>
      <div className="player-center"><div className="player-controls"><button className={shuffle ? 'control-active' : ''} onClick={() => setShuffle(!shuffle)} title="Shuffle"><Shuffle size={16}/></button><button onClick={() => moveTrack(-1)} title="Previous"><SkipBack size={19} fill="currentColor"/></button><button className="play-main" onClick={() => setPlaying(!playing)} title={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button><button onClick={() => moveTrack(1)} title="Next"><SkipForward size={19} fill="currentColor"/></button><button className={repeat ? 'control-active' : ''} onClick={() => setRepeat(!repeat)} title="Repeat"><Repeat size={16}/></button></div><div className="progress-row"><span>{formatTime(progress)}</span><input aria-label="Track progress" type="range" min="0" max={duration || 100} value={Math.min(progress, duration || 100)} onChange={e => {const n = Number(e.target.value);if(audioRef.current)audioRef.current.currentTime=n;setProgress(n)}}/><span>{formatTime(duration)}</span></div></div>
      <div className="player-right"><button className="icon-button" title="Queue"><ListMusic size={18}/></button><button className="icon-button" title="Volume" onClick={() => setMuted(!muted)}>{muted || volume === 0 ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={e => {setVolume(Number(e.target.value));setMuted(false)}}/></div>
    </div>
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}

function TrackTable({ tracks, currentId, playing, liked, onPlay, onLike, onAdd }) {
  const [menuId, setMenuId] = useState(null);
  if (!tracks.length) return null;
  return <div className="track-table"><div className="track-head"><span>#</span><span>TITLE</span><span>ALBUM</span><span><Clock3 size={15}/></span><span></span></div>
    {tracks.map((t, i) => <div className={`track-row ${currentId === t.id ? 'track-current' : ''}`} key={t.id}>
      <span className="track-index">{currentId === t.id && playing ? <span className="equalizer"><i/><i/><i/></span> : <>{i + 1}<button className="row-play" onClick={() => onPlay(t)} aria-label={`Play ${t.name}`}><Play size={15} fill="currentColor"/></button></>}</span>
      <button className="track-title" onClick={() => onPlay(t)}><Cover color={t.color} small/><span><b>{t.name}</b><small>{t.artist}{t.source ? ` · ${t.source}` : t.local ? ' · Local file' : ''}</small></span></button>
      <span className="track-album">{t.album}</span><span className="track-duration">{t.duration}</span>
      <div className="track-actions"><button className={`like-button ${liked.includes(t.id) ? 'is-liked' : ''}`} onClick={() => onLike(t.id)} title="Like"><Heart size={16} fill={liked.includes(t.id) ? 'currentColor' : 'none'}/></button><div className="track-menu-wrap"><button className="icon-button" onClick={() => setMenuId(menuId === t.id ? null : t.id)} title="More options"><MoreHorizontal size={18}/></button>{menuId === t.id && <div className="track-menu">{/* Playlist action uses the first available playlist */}<button onClick={() => {onAdd(t);setMenuId(null)}}><Plus size={15}/> Add current to playlist</button><button onClick={() => {onPlay(t);setMenuId(null)}}><Play size={15}/> Play track</button></div>}</div></div>
    </div>)}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
