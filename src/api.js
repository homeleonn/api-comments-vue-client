const apiUrl = process.env.VUE_APP_COMMENTS_API_URL;

export async function getComments() {
  let response = await fetch(apiUrl);
  return response.ok ? await response.json() : console.log(`Error: ${response.status}`);
}

export async function addComment(comment, callback = null) {
  return await apiSend(``, comment, callback);
}

export async function destroyComment(commentId, callback = null) {
  return await apiSend(`/${commentId}`, { _method: 'DELETE' }, callback);
}

export async function updateComment(comment, callback = null) {
  comment._method = 'PUT';
  return await apiSend(`/${comment.id}`, comment, callback);
}

export async function replyComment(comment, callback = null) {
  return await apiSend('/reply', comment, callback);
}

async function apiSend(urlParams, comment = null, callback = null) {
  let result;
  let response = await fetch(`${apiUrl}${urlParams}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify(comment)
  });

  try {
    if ([200, 201, 422].includes(response.status)) {
      result = await response.json();
    }
  } catch (e) {
    console.log(e);
  }

  if (typeof callback == 'function') {
    return callback(result, response);
  }

  return result;
}
