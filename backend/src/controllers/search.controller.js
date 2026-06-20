"use strict";

const searchService = require("../services/search.service");
const { sendSuccess } = require("../utils/apiResponse");

exports.searchListings = async (req, res) => {
  const params = req.query;

  const { listings, pagination } = await searchService.executeSearch({
    ...params,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });

  return sendSuccess(res, { listings, pagination });
};

exports.autocomplete = async (req, res) => {
  const { q, limit = 8 } = req.query;

  const suggestions = await searchService.getAutocompleteSuggestions(q, limit);

  return sendSuccess(res, { suggestions });
};

exports.getHistogram = async (req, res) => {
  const histogram = await searchService.getPriceHistogram(req.query, 20);
  return sendSuccess(res, histogram);
};

exports.getFacets = async (req, res) => {
  const facets = await searchService.getSearchFacets(req.query);
  return sendSuccess(res, facets);
};
