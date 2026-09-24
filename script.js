// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = "https://sovybkcqlmtznorhqdap.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdnlia2NxbG10em5vcmhxZGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODU5OTYsImV4cCI6MjEwNTg2MTk5Nn0.7QmukKLyEMRSr0Q2KcpvSizsuUC7xz4EYCo4OEaBK90I";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  carregarPosts();
});

async function carregarPosts() {
  try {
    const { data: posts, error } = await _supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    const container = document.getElementById('feed-container');
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #888;">Nenhuma publicação encontrada.</p>';
      return;
    }

    posts.forEach(post => {
      let imagens = [];
      try {
        imagens = typeof post.imagens === 'string' ? JSON.parse(post.imagens) : post.imagens;
      } catch (e) {
        imagens = [];
      }

      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-titulo', (post.titulo || '').toLowerCase());
      card.setAttribute('data-descricao', (post.descricao || '').toLowerCase());
      card.setAttribute('data-data', (post.data || '').toLowerCase());
      card.setAttribute('data-autor', (post.autor || '').toLowerCase());

      let imagensHTML = '';
      let bolinhasHTML = '';

      if (Array.isArray(imagens) && imagens.length > 0) {
        imagens.forEach((imgUrl, index) => {
          if (imgUrl) {
            imagensHTML += `<img src="${imgUrl}" onclick="abrirModal(this.src)" alt="Imagem do post">`;
            if (imagens.length > 1) {
              bolinhasHTML += `<div class="dot ${index === 0 ? 'active' : ''}"></div>`;
            }
          }
        });
      }

      let carouselWrapper = '';
      if (imagensHTML !== '') {
        const botoesNav = imagens.length > 1 ? `
          <button class="nav-btn prev" onclick="mudarFoto(this, -1)">&#10094;</button>
          <button class="nav-btn next" onclick="mudarFoto(this, 1)">&#10095;</button>
        ` : '';

        carouselWrapper = `
          <div class="carousel-wrapper">
            ${botoesNav}
            <div class="carousel" onscroll="atualizarBolinhas(this)">
              ${imagensHTML}
            </div>
          </div>
        `;
      }

      const dotsContainer = bolinhasHTML !== '' ? `<div class="dots">${bolinhasHTML}</div>` : '';

      card.innerHTML = `
        <div class="header">${post.autor || 'PostTrack'}</div>
        <div class="title">${post.titulo || ''}</div>
        ${carouselWrapper}
        ${dotsContainer}
        <div class="footer"><b>${post.autor || 'PostTrack'}</b> ${post.descricao || ''}</div>
        <div class="date">${post.data || ''}</div>
      `;

      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar o feed:", erro);
  }
}

function filtrarPosts() {
  const termo = document.getElementById('search').value.toLowerCase();
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const titulo = card.getAttribute('data-titulo');
    const descricao = card.getAttribute('data-descricao');
    const data = card.getAttribute('data-data');
    const autor = card.getAttribute('data-autor');

    if (titulo.includes(termo) || descricao.includes(termo) || data.includes(termo) || autor.includes(termo)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function mudarFoto(btn, direcao) {
  const wrapper = btn.parentElement;
  const carousel = wrapper.querySelector('.carousel');
  const larg = carousel.clientWidth;
  carousel.scrollBy({ left: direcao * larg, behavior: 'smooth' });
}

function atualizarBolinhas(carousel) {
  const card = carousel.closest('.card');
  const dots = card.querySelectorAll('.dot');
  if (dots.length === 0) return;

  const larg = carousel.clientWidth;
  const index = Math.round(carousel.scrollLeft / larg);

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function abrirModal(src) {
  const modal = document.getElementById('modal');
  const imgModal = document.getElementById('img-modal');
  modal.style.display = 'flex';
  imgModal.src = src;
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}