import * as searchService from "../services/search.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const searchListings = async (req, res) => {
  const params = req.query;

  const { listings, pagination } = await searchService.executeSearch({
    ...params,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });

  return sendSuccess(res, { listings, pagination });
};

export const autocomplete = async (req, res) => {
  const { q, limit = 8 } = req.query;
  const suggestions = await searchService.getAutocompleteSuggestions(q, limit);
  return sendSuccess(res, { suggestions });
};

export const getHistogram = async (req, res) => {
  const histogram = await searchService.getPriceHistogram(req.query, 20);
  return sendSuccess(res, histogram);
};

export const getFacets = async (req, res) => {
  const facets = await searchService.getSearchFacets(req.query);
  return sendSuccess(res, facets);
};
