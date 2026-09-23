import { describe, it, expect } from 'vitest';
import { getInitials, minutesToHours, capitalize } from '../utils/helpers';

describe('helpers', () => {
  it('getInitials returns up to two initials', () => {
    expect(getInitials('John Smith')).toBe('JS');
    expect(getInitials('Arya')).toBe('A');
    expect(getInitials('')).toBe('');
  });

  it('capitalize formats snake_case strings', () => {
    expect(capitalize('in_progress')).toBe('In progress');
    expect(capitalize('closed')).toBe('Closed');
  });

  it('minutesToHours converts minutes', () => {
    expect(minutesToHours(90)).toBe('1h 30m');
    expect(minutesToHours(45)).toBe('45m');
  });
});
