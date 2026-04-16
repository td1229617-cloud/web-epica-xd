let userName = '';

document.getElementById('confirmName').addEventListener('click', function() {
    const nameInput = document.getElementById('userName').value.trim();
    if (nameInput) {
        userName = nameInput;
        document.getElementById('nameSection').style.display = 'none';
        document.getElementById('postSection').style.display = 'block';
        loadPosts();
    } else {
        alert('Por favor, ingresa un nombre.');
    }
});

document.getElementById('postMessage').addEventListener('click', function() {
    const message = document.getElementById('message').value.trim();
    if (message) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const newPost = {
            id: Date.now(),
            author: userName,
            content: message,
            votes: 0
        };
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        document.getElementById('message').value = '';
        loadPosts();
    } else {
        alert('Por favor, escribe un mensaje.');
    }
});

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <strong>${post.author}:</strong> ${post.content}<br>
            <span>Votos: <span id="votes-${post.id}">${post.votes}</span></span>
            <button class="vote" onclick="vote(${post.id}, 1)">+1</button>
            <button class="vote" onclick="vote(${post.id}, -1)">-1</button>
        `;
        postsDiv.appendChild(postDiv);
    });
}

function vote(postId, delta) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes += delta;
        localStorage.setItem('posts', JSON.stringify(posts));
        document.getElementById(`votes-${postId}`).textContent = post.votes;
    }
}

// Cargar posts al inicio si ya hay nombre
if (userName) {
    loadPosts();
}