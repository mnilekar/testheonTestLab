import catalogueData from '../../content/challenges/challenges.json';
import manifestData from '../../fixtures/manifest.json';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export interface Challenge {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  skills: string[];
  technology: 'Playwright';
  feature: string;
  application: string;
  scenario: string;
  objective: string;
  preconditions: string[];
  testData: string[];
  expectedResult: string;
  hints: string[];
  relatedGuide: { title: string; url: string };
  relatedFixtures: string[];
  starterCode?: string;
  solutionApproach: string[];
  solutionCode?: string;
  estimatedMinutes: number;
  version: string;
}

export const challenges = catalogueData.challenges as Challenge[];
export const challengeBySlug = new Map(
  challenges.map((challenge) => [challenge.slug, challenge]),
);
export const fixtureById = new Map(
  manifestData.fixtures.map((fixture) => [fixture.id, fixture]),
);

export function fixtureHref(challenge: Challenge): string {
  const fixture = fixtureById.get(challenge.relatedFixtures[0] ?? '');
  return fixture ? `${fixture.url}${fixture.anchor ?? ''}` : '/practice/';
}

export function uniqueChallengeValues(
  key: 'difficulty' | 'feature' | 'application' | 'technology',
): string[] {
  return [...new Set(challenges.map((challenge) => challenge[key]))].sort();
}

export const allSkills = [
  ...new Set(challenges.flatMap((challenge) => challenge.skills)),
].sort();
