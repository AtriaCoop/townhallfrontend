import { Icons } from './Icons';

export default function Icon({ name, ...props }) {
	const IconComponent = Icons[name];
	if (!IconComponent) {
		return null;
	}
	return <IconComponent {...props} />;
}