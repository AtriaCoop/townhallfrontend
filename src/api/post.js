import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';

export async function updatePost(postId, { content, pinned, tags = [] }) {
	const formData = new FormData();

	if (content !== undefined) formData.append("content", content);
	if (pinned !== undefined) formData.append("pinned", pinned);

	tags.forEach((tag) => {
		formData.append("tags", tag);
	});

	const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/post/${postId}/`, {
		method: "PATCH",
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to update post: ${errorText}`);
	}

	return await response.json();
}

export async function createPost({ content, images = [], pinned, tags = [], anonymous }) {
	const formData = new FormData();
	formData.append("content", content)
	images.forEach((img) => formData.append("images", img));
	if (pinned) { formData.append("pinned", pinned) };
	if (anonymous) { formData.append("anonymous", anonymous); }

	tags.forEach((tag) => {
		formData.append("tags", tag);
	});

	const response = await authenticatedFetch(`${BASE_URL}/post/`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create post: ${errorText}`);
	}

	return await response.json();
}

export async function addPostImages(postId, images) {
	const formData = new FormData();
	images.forEach((img) => formData.append("images", img));

	const response = await authenticatedFetch(`${BASE_URL}/post/${postId}/images/`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to add images: ${errorText}`);
	}

	return await response.json();
}

export async function deletePostImage(postId, imageId) {
	const response = await authenticatedFetch(`${BASE_URL}/post/${postId}/images/${imageId}/`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to delete image: ${errorText}`);
	}

	return await response.json();
}