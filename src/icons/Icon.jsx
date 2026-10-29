import { Icons } from './Icons';
import { TriangleAlert } from 'lucide-react';
import { CircleCheck, CircleAlert } from "lucide-react"; 

export default function Icon({ name, ...props }) {
	const IconComponent = Icons[name];
	if (!IconComponent) {
		return <TriangleAlert {...props} />;
	}
	return <IconComponent {...props} />;
}

export const EVENT_ICONS = {
  success: CircleCheck,
  error: CircleAlert,
}; 