import { Icons } from './Icons';
import { TriangleAlert } from 'lucide-react';

export default function Icon({ name, ...props }) {
	const IconComponent = Icons[name];
	if (!IconComponent) {
		return <TriangleAlert {...props} />;
	}
	return <IconComponent {...props} />;
}