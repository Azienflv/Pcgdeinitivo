const SUPABASE_URL = "https://gqurgezuuytxrcmudnik.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY_AQUI";

const supabaseGallery = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadDynamicTourGallery() {
  try {
    const widget = document.querySelector("[data-tour]");
    const gallery = document.querySelector(".tour-gallery-gyg");

    if (!widget || !gallery) return;

    const tourSlug = widget.dataset.tour;

    const { data, error } = await supabaseGallery
      .from("productos")
      .select("imagen_url, imagenes_urls")
      .eq("slug", tourSlug)
      .single();

    if (error || !data) {
      console.warn("No dynamic gallery found, using manual images");
      return;
    }

    const images = Array.isArray(data.imagenes_urls) && data.imagenes_urls.length
      ? data.imagenes_urls
      : data.imagen_url
        ? [data.imagen_url]
        : [];

    if (!images.length) return;

    const mainImage = images[0];
    const thumbs = images.slice(1, 4);

    gallery.innerHTML = `
      <div class="tour-gallery-main">
        <img src="${mainImage}" alt="${tourSlug}">
      </div>

      <div class="tour-gallery-grid">
        ${
          thumbs.map(img => `
            <img src="${img}" alt="${tourSlug}">
          `).join("")
        }

        <div class="tour-gallery-more">
          <span>View all photos</span>
        </div>
      </div>
    `;

  } catch (err) {
    console.error("Error loading dynamic gallery:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDynamicTourGallery);
