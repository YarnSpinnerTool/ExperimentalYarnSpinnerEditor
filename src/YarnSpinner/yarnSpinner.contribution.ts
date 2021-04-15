import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'yarnspinner',
	extensions: ['.yarn'],
	aliases: ['YS', 'yarnspinner'],
	mimetypes: ['text/yarn'],
	loader: () => import('./yarn')
});