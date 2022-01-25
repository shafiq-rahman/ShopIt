const btn = document.querySelectorAll(".brand")
const products = document.querySelectorAll(".product")

for (let bu of btn) {
    bu.addEventListener("change", e => {
        const brand = e.target.dataset.filter
        if (bu.checked) {
            products.forEach((ele) => {
                if (ele.classList.contains(brand)) {
                    ele.classList.add("checked")
                    ele.style.display = "block"
                } else if (!ele.classList.contains("checked")) {
                    ele.style.display = "none"
                }
            })
        } else {
            let flag = 0;
            products.forEach((ele) => {
                if (ele.classList.contains(brand)) {
                    ele.classList.remove("checked")
                    ele.style.display = "none"
                } else if(ele.classList.contains("checked")) {
                    flag = 1
                }
            })
            if (!flag) {
                products.forEach(ele => {
                    ele.style.display = "block"
                })
            }
        }
    })
}

const search = document.querySelector(".search")
const pname = document.querySelectorAll("h6")
search.addEventListener("keyup", e => {
    e.preventDefault()
    const searchTerm = search.value.toLowerCase()
    for (let i = 0; i < pname.length; i++){
        const name = products[i].querySelector("h6").textContent
        if (name.toLocaleLowerCase().indexOf(searchTerm) > -1) {
            products[i].style.display = "block"
        } else {
            products[i].style.display = "none"
        }
    }

})