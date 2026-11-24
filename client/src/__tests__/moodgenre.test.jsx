import { test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GENRES } from '../utils/constants';
import { MOODS, GENRE_CHOICES, moodFromGenre } from '../utils/constants';
import SongFilterBar from '../components/song/SongFilterBar';

afterEach(cleanup);

test('genre choices hold no moods (except Other); every mood is still a valid server genre', () => {
  expect(GENRE_CHOICES).toEqual(expect.arrayContaining(['💃 Dance', '🎤 Rap', '🎼 Other']));
  expect(GENRE_CHOICES.filter((g) => g !== '🎼 Other').some((g) => MOODS.includes(g))).toBe(false);
  MOODS.forEach((m) => expect(GENRES).toContain(m));
});

test('moodFromGenre mirrors the server', () => {
  expect(moodFromGenre('💔 Heartbreak')).toBe('💔 Heartbreak');
  expect(moodFromGenre('💃 Dance')).toBeNull();
  expect(moodFromGenre('🎼 Other')).toBeNull();
});

test('filter bar has separate Mood and Genre selects', () => {
  const onMoodChange = vi.fn();
  render(<SongFilterBar search="" onSearchChange={() => {}} mood="" onMoodChange={onMoodChange} genre="" onGenreChange={() => {}} artist="" onArtistChange={() => {}} album="" onAlbumChange={() => {}} />);
  const mood = screen.getByLabelText('Mood');
  const genre = screen.getByLabelText('Genre');
  expect([...mood.options].map((o) => o.value)).toContain('💔 Heartbreak');
  expect([...genre.options].map((o) => o.value)).not.toContain('💔 Heartbreak');
  expect([...genre.options].map((o) => o.value)).toContain('💃 Dance');
  fireEvent.change(mood, { target: { value: '😌 Chill' } });
  expect(onMoodChange).toHaveBeenCalledWith('😌 Chill');
});
