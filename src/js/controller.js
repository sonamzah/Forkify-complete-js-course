//Model
import * as model from './model.js';
//Config
import { MODAL_CLOSE_SEC } from './config.js';
//Views
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

//npm polyfill and transpilation packages
import 'core-js/stable';
import 'regenerator-runtime/runtime';

//Hot module reloading -- injects updates w/o reload
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // 1. Get hash id
    const id = window.location.hash.slice(1);
    //gaurd clause
    if (!id) return;

    recipeView.renderSpinner();

    // 1. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks); // Update bookmarks

    // 2. Loading recipe -- async function so need to Await the promise!
    await model.loadRecipe(id);

    // 3. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(`controller: ${err}`);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1. Get search query
    const query = searchView.getQuery();
    //TODO: add timeout for the render spinner if no  query
    if (!query) return;

    resultsView.renderSpinner();
    // 2. Load search results -- async and no return value
    // -- simply changes model.state (necessary side effect)
    await model.loadSearchResults(query);

    // 3. Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination buttons
    paginationView.render(model.state.search);

    // console.log(model.getSearchResultsPage(1));
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1. Update recipe servings (in state)
  model.updateServings(newServings);
  // console.log(model.state.recipe);

  // 2. Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add/delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render Loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe data
    await model.uploadRecipe(newRecipe);

    // Render new recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    //Render bookmarkview
    bookmarksView.render(model.state.bookmarks);

    // ChangeID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close form window
    setTimeout(function () {
      if (!addRecipeView.windowIsHidden()) {
        addRecipeView.toggleWindow();
      }
      setTimeout(() => addRecipeView.render({}), 300);
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`💀 ${err}`);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  console.log('start!');
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

// window.addEventListener('click', controlServings);
