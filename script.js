let userName = '';
let selectedFiles = [];

// Confirmar nombre
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

// Manejar selección de archivos
document.getElementById('fileInput').addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);
    updateFilePreview();
});

// Limpiar archivos seleccionados
document.getElementById('clearFiles').addEventListener('click', function() {
    selectedFiles = [];
    document.getElementById('fileInput').value = '';
    updateFilePreview();
});

// Actualizar vista previa de archivos
function updateFilePreview() {
    const fileList = document.getElementById('fileList');
    const filePreview = document.getElementById('filePreview');
    const imagePreview = document.getElementById('imagePreview');
    
    fileList.innerHTML = '';
    imagePreview.style.display = 'none';
    
    if (selectedFiles.length === 0) {
        filePreview.style.display = 'none';
        return;
    }
    
    filePreview.style.display = 'block';
    
    selectedFiles.forEach(file => {
        const item = document.createElement('div');
        item.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileList.appendChild(item);
        
        // Mostrar vista previa de imagen
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Convertir archivo a Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// Publicar mensaje con archivos
document.getElementById('postMessage').addEventListener('click', async function() {
    const message = document.getElementById('message').value.trim();
    
    if (!message && selectedFiles.length === 0) {
        alert('Por favor, escribe un mensaje o carga un archivo.');
        return;
    }
    
    try {
        // Convertir archivos a Base64
        const filesBase64 = [];
        for (const file of selectedFiles) {
            const base64 = await fileToBase64(file);
            filesBase64.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            });
        }
        
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const newPost = {
            id: Date.now(),
            author: userName,
            content: message,
            files: filesBase64,
            votes: 0,
            timestamp: new Date().toLocaleString()
        };
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Limpiar formulario
        document.getElementById('message').value = '';
        selectedFiles = [];
        document.getElementById('fileInput').value = '';
        updateFilePreview();
        
        loadPosts();
    } catch (error) {
        alert('Error al procesar archivos: ' + error.message);
    }
});

// Descargar archivo
function downloadFile(fileName, fileData) {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Cargar y mostrar posts
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    
    if (posts.length === 0) {
        postsDiv.innerHTML = '<p style="text-align: center; color: #999;">No hay publicaciones aún.</p>';
        return;
    }
    
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        
        let filesHTML = '';
        if (post.files && post.files.length > 0) {
            filesHTML = '<div class="post-files"><strong>Archivos:</strong><br>';
            post.files.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    filesHTML += `<img src="${file.data}" class="post-image" alt="${file.name}">`;
                }
                filesHTML += `<span class="file-item">
                    <a class="file-link" onclick="downloadFile('${file.name}', '${file.data}')">${file.name}</a>
                    (${(file.size / 1024).toFixed(2)} KB)
                </span>`;
            });
            filesHTML += '</div>';
        }
        
        postDiv.innerHTML = `
            <div class="post-author">👤 ${post.author}</div>
            ${post.timestamp ? `<small style="color: #999;">📅 ${post.timestamp}</small>` : ''}
            ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
            ${filesHTML}
            <div class="vote-section">
                <span>👍 Votos: <strong id="votes-${post.id}">${post.votes}</strong></span>
                <button class="vote" onclick="vote(${post.id}, 1)">👍 +1</button>
                <button class="vote" onclick="vote(${post.id}, -1)">👎 -1</button>
            </div>
        `;
        postsDiv.appendChild(postDiv);
    });
}

// Sistema de votos
function vote(postId, delta) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.votes += delta;
        localStorage.setItem('posts', JSON.stringify(posts));
        document.getElementById(`votes-${postId}`).textContent = post.votes;
    }
}