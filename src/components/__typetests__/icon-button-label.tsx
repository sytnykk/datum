// Type test, checked by `npm run typecheck`: proves the accessibility rule is enforced by the compiler.
// If an IconButton without aria-label ever compiles, the @ts-expect-error below becomes unused and tsc fails.
import { DotsThree } from '@phosphor-icons/react';
import { IconButton } from '../IconButton';

export const labelled = <IconButton icon={<DotsThree />} aria-label="More actions" />;

// @ts-expect-error aria-label is required on IconButton
export const unlabelled = <IconButton icon={<DotsThree />} />;
