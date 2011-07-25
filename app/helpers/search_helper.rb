module SearchHelper
  def minutes_to_words(minutes)
    days = minutes.to_i / 1440
    minutes = minutes.to_i % 1440 if days > 0

    hours = minutes / 60
    minutes = minutes.to_i % 60 if hours > 0

    time_in_words = []
    time_in_words << "#{pluralize(days, 'day', 'days')}" if days > 0
    time_in_words << "#{pluralize(hours, 'hour', 'hours')}" if hours > 0
    time_in_words << "#{pluralize(minutes, 'minute', 'minutes')}" if minutes > 0

    time_in_words.join(", ")
  end

  def number_of_hits_for_page(num_results, page_number)
    page_number = page_number.to_i
    num_full_pages = num_results / Meep::SEARCH_RESULTS_PER_PAGE

    if page_number > num_full_pages
      num_full_pages = num_results % Meep::SEARCH_RESULTS_PER_PAGE
    else
      Meep::SEARCH_RESULTS_PER_PAGE
    end
  end
end
