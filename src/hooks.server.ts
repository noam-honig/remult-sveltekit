import { sequence } from '@sveltejs/kit/hooks';
import { handleRemult } from './handleRemult';

export const handle = sequence(handleRemult);
