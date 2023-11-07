---
# Leave the homepage title empty to use the site title
title: ''
date: 2023-11-06
type: landing

sections:
  - block: collection
    id: posts
    content:
      title: Recent Posts
      subtitle: ''
      text: ''
      # Choose how many pages you would like to display (0 = all pages)
      count: 5
      # Filter on criteria
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view
      view: compact
      columns: '2'
  - block: tag_cloud
    content:
      title: I Talk About...
    design:
      columns: '2'
  - block: about.biography
    id: about
    content:
      title: Biography
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
  - block: experience
    content:
      title: Experience
      # Date format for experience
      #   Refer to https://wowchemy.com/docs/customization/#date-format
      date_format: Jan 2006
      # Experiences.
      #   Add/remove as many `experience` items below as you like.
      #   Required fields are `title`, `company`, and `date_start`.
      #   Leave `date_end` empty if it's your current employer.
      #   Begin multi-line descriptions with YAML's `|2-` multi-line prefix.
      items:
        - title: Senior Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          location: Ankeny, IA
          date_start: '2021-12-20'
          date_end: ''
        - title: Software Engineer III
          company: Comoto Holdings, Inc.
          company_url: 'https://ridecomoto.com/'
          company_logo: org-x
          location: Philadelphia, PA
          date_start: '2021-06-28'
          date_end: '2021-11-28'
        - title: Senior Application Developer
          company: Homesteaders Life Company
          company_url: 'https://www.homesteaderslife.com/'
          location: Des Moines, IA
          date_start: '2020-08-17'
          date_end: '2021-06-28'
        - title: Web Application Developer
          company: Polk County
          company_url: 'https://www.polkcountyiowa.gov'
          location: Des Moines, IA
          date_start: '2019-08-21'
          date_end: '2020-08-14'
        - title: Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          location: Ankeny, IA
          date_start: '2019-03-16'
          date_end: '2019-08-21'
        - title: Associate Web Developer
          company: Polk County
          company_url: 'https://www.polkcountyiowa.gov'
          location: Des Moines, IA
          date_start: '2016-06-26'
          date_end: '2019-03-16'
    design:
      columns: '2'
  - block: markdown
    content:
      title: Computers
      subtitle: 'I love hardware. Here are some of the computers I've built over the years.'
      text: |-
        {{< gallery album="computers" >}}
    design:
      columns: '1'
---
