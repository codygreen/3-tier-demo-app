<template>
  <div class="product-item">
    <img v-bind:src="api_url + product.imageUrl" />
    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-price">${{ product.price }}</p>
    <router-link v-bind:to="'/products/' + product.id">
      <button>View Details</button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "ProductsGridItem",
  props: ["product"],
  data() {
    return {
      api_url: localStorage.api_url,
    };
  },
};
</script>

<style scoped>
.product-item {
  align-items: center;
  border-radius: 8px;
  box-shadow: 0px 2px 5px #888;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
  padding: 20px;
  position: relative;
  width: 32%;
}

.product-name {
  margin-bottom: 0;
  height: 15%;
}

img {
  height: 200px;
  width: 200px;
}

a {
  width: 100%;
}

button {
  width: 100%;
}
</style>