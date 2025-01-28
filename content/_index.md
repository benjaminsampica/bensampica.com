---
# Leave the homepage title empty to use the site title
title: ""
date: 2024-11-18
type: landing

design:
  # Default section spacing
  spacing: "3rem"

sections:
  - block: collection
    id: news
    content:
      title: Recent Posts
      subtitle: ''
      text: ''
      # Page type to display. E.g. post, talk, publication...
      page_type: post
      # Choose how many pages you would like to display (0 = all pages)
      count: 5
      # Filter on criteria
      filters:
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
  - block: resume-biography-3
    id: about
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ""
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      css_class: dark
      background:
        color: dark
        image:
        #   Add your image background to `assets/media/`.
          filename: parabolic-rectangle.svg
          filters:
            brightness: 1.0
          size: cover
          position: center
          parallax: true
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
        - title: Co-Founder
          company: Send Trucks
          company_url: 'https://www.sendtrucks.com'
          location: Ankeny, IA
          date_start: '2023-06-01'
          date_end: ''
        - title: Lead Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          location: Ankeny, IA
          date_start: '2024-06-01'
          date_end: ''
        - title: Senior Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          location: Ankeny, IA
          date_start: '2021-12-20'
          date_end: '2024-06-01'
        - title: Software Engineer III
          company: Comoto Holdings, Inc.
          company_url: 'https://ridecomoto.com/'
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
      text: |-
        I love hardware. Here are some of the computers I have built over the years.
        ![](/albums/computers/8.jpg)
        ![](/albums/computers/9.jpg)
        ![](/albums/computers/10.jpg)
        ![](/albums/computers/11.jpg)
        ![](/albums/computers/12.jpg)
        ![](/albums/computers/13.jpg)
        ![](/albums/computers/14.jpg)
        ![](/albums/computers/15.jpg)
        ![](/albums/computers/16.jpg)
        ![](/albums/computers/17.jpg)
        ![](/albums/computers/20.jpg)
        ![](/albums/computers/21.jpg)
    design:
      columns: 2
---
