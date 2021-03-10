<template>
  <div id="page-wrap" v-if="product" :key="product.id">
    <div id="img-wrap">
      <img v-bind:src="this.api_url + product.imageUrl" />
    </div>
    <div id="product-details">
      <h1>{{ product.name }}</h1>
      <h3 id="price">${{ product.price }}</h3>
      <p><b>Average rating</b>: {{ product.averageRating }}</p>
      <p>{{ product.description }}</p>
      <Inventory :id="this.product.id" v-if="showService('inventory')" />
      <button
        id="add-to-cart"
        v-if="!itemIsInCart && !showSuccessMessage"
        v-on:click="addToCart"
      >
        Add to Cart
      </button>
      <button
        id="add-to-cart"
        class="green-button"
        v-if="!itemIsInCart && showSuccessMessage"
      >
        Successfully added item to cart!
      </button>
      <button id="add-to-cart" class="grey-button" v-if="itemIsInCart">
        Item is already in cart
      </button>
    </div>
    <Recommendations v-if="showService('recommendations')" />
  </div>
  <NotFoundPage v-else />
</template>

<script>
import axios from "axios";
import NotFoundPage from "./NotFoundPage";
import Recommendations from "../components/Recommendations";
import Inventory from "../components/Inventory";

export default {
  name: "ProductDetailPage",
  components: {
    NotFoundPage,
    Recommendations,
    Inventory,
  },
  data() {
    return {
      product: {},
      cartItems: [],
      showSuccessMessage: false,
      api_url: localStorage.api_url,
    };
  },
  computed: {
    itemIsInCart() {
      return this.cartItems.some((item) => item.id === this.product.id);
    },
  },
  methods: {
    async addToCart() {
      await axios.post(`${this.api_url}/api/users/12345/cart`, {
        productId: this.$route.params.id,
      });
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.$router.push("/products");
      }, 1500);
    },
    showService(serviceName) {
      switch (localStorage.getItem(serviceName + "_url")) {
        case null:
        case "null":
        case "":
        case undefined:
          return false;
        default:
          return true;
      }
    },
  },
  async created() {
    if (!this.api_url || this.api_url == "null")
      this.$router.push("/stats?config=first");
    else {
      try {
        const { data: product } = await axios.get(
          `${this.api_url}/api/products/${this.$route.params.id}`
        );

        this.product = product[0];

        const { data: cartItems } = await axios.get(
          `${this.api_url}/api/users/12345/cart`
        );
        this.cartItems = cartItems;
      } catch (err) {
        this.product = null;
      }
    }
  },
};
</script>

<style scoped>
#page-wrap {
  margin-top: 16px;
  padding: 16px;
  max-width: 600px;
}

#img-wrap {
  text-align: center;
}

img {
  width: 400px;
}

#product-details {
  padding: 16px;
  position: relative;
}

#add-to-cart {
  width: 100%;
}

#price {
  position: absolute;
  top: 24px;
  right: 16px;
}

.green-button {
  background-color: green;
}

.grey-button {
  background-color: #888;
}
</style>
