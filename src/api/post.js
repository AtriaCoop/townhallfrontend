import { getCookie } from '@/utils/authHelpers';

export async function updatePost(postId, { content, image, pinned }) {
	const formData = new FormData();
  
	if (content !== undefined) formData.append("content", content);
	if (image !== undefined && image !== null) formData.append("image", image);
	if (pinned !== undefined) formData.append("pinned", pinned);
  
	const csrfToken = getCookie("csrftoken")
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/post/${postId}/`, {
	  method: "PATCH",
	  credentials: "include",
	  headers: {
		"X-CSRFToken": csrfToken
	  },
	  body: formData,
	});
  
	if (!response.ok) {
	  const errorText = await response.text();
	  throw new Error(`Failed to update post: ${errorText}`);
	}
  
	return await response.json();
  }

export async function createPost({content, images = [], pinned}) {
	const formData = new FormData();
	formData.append("content", content)
	images.forEach((img) => formData.append("image", img));
    if(pinned) {formData.append("pinned", pinned)};

	const csrfToken = getCookie("csrftoken")
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/post/`, {
		method: "POST",
		credentials: "include",
		headers: {
			"X-CSRFToken": csrfToken
		},
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create post: ${errorText}`);
	}

	return await response.json();
}