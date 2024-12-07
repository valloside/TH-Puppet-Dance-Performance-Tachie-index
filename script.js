document.addEventListener("DOMContentLoaded", async () => {
    const gallery = document.getElementById("gallery");
    const searchInput = document.getElementById("search");

    let isComposing = false; // 标志是否处于拼音输入阶段

    const data = await fetch("id-name.json").then((res) => res.json());

    const sortedKeys = Object.keys(data).sort(
        (a, b) => parseInt(a) - parseInt(b)
    );

    // 构造角色卡片的HTML
    const createCharacterCard = (id, names, variants) => {
        const subImages = Array.from({ length: variants })
            .map((_, index) => {
                const subId = index.toString().padStart(2, "0");
                return `<img data-src="images/${id}_${subId}.png" alt="${id}_${subId}" class="lazy" style="width: 150px; height: auto; object-fit: cover;">`;
            })
            .join("");

        return `
            <div class="character-card" data-aos="fade-right">
                <a class="character-title" data-id="${id}" href="javascript:void(0)">
                    [${id}] ${
            names[0] ? names[0] : ""
        }  <span class="toggle-btn">[+]</span>
                </a>
                <div class="sub-images hidden">${subImages}</div>
            </div>
        `;
    };

    // 渲染角色列表
    const renderGallery = (query = "") => {
        gallery.innerHTML = ""; // 清空画廊
        sortedKeys.forEach((id) => {
            const { names, variants } = data[id];
            if (
                query === "" ||
                names.some((name) =>
                    name.toLowerCase().includes(query.toLowerCase())
                ) ||
                id.includes(query)
            ) {
                const cardHTML = createCharacterCard(id, names, variants);
                gallery.insertAdjacentHTML("beforeend", cardHTML);
            }
        });
        lazyLoadImages(); // 懒加载
        addToggleFunctionality(); // 折叠功能
    };

    // 懒加载图片
    const lazyLoadImages = () => {
        const lazyImages = document.querySelectorAll("img.lazy");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy");
                    img.classList.add("lazy-loaded");
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => observer.observe(img));
    };

    // 添加折叠功能
    const addToggleFunctionality = () => {
        const titles = document.querySelectorAll(".character-title");
        titles.forEach((title) => {
            title.addEventListener("click", () => {
                const subImages = title.nextElementSibling;
                if (subImages.classList.contains("hidden")) {
                    subImages.classList.remove("hidden");
                    title.querySelector(".toggle-btn").textContent = "[-]";
                } else {
                    subImages.classList.add("hidden");
                    title.querySelector(".toggle-btn").textContent = "[+]";
                }
            });
        });
    };

    // 搜索框事件监听
    searchInput.addEventListener("input", () => {
        if (isComposing) return;
        const query = searchInput.value.trim();
        renderGallery(query);
    });

    // 拼音输入状态监听
    searchInput.addEventListener("compositionstart", () => {
        isComposing = true;
    });

    searchInput.addEventListener("compositionend", () => {
        isComposing = false;
        const query = searchInput.value.trim();
        if (query !== "") {
            renderGallery(query);
        }
    });

    // 初始渲染
    renderGallery();
});
