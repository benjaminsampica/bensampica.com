---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2026-03-12
type: landing

design:
  # Default section spacing
  spacing: '0'

sections:
  - block: dev-hero
    id: hero
    content:
      username: me
      greeting: "Hello, I'm"
      show_status: true
      show_scroll_indicator: true
      scroll_target: "#blog"
      typewriter:
        enable: true
        prefix: "I build"
        strings:
          - ".NET web applications"
          - "pragmatic cloud systems"
          - "software teams that deliver"
          - "the right thing - just in time"
        type_speed: 70
        delete_speed: 40
        pause_time: 2500
      cta_buttons:
        - text: Read My Blog
          url: "/blog/"
          icon: arrow-down
        - text: Get In Touch
          url: "#contact"
          icon: envelope
    design:
      style: centered
      avatar_shape: circle
      animations: true
      background:
        color:
          light: "#fafafa"
          dark: "#0a0a0f"
      spacing:
        padding: ["5rem", "0", "3rem", "0"]

  - block: collection
    id: blog
    content:
      title: Recent Posts
      subtitle: 'Writing on .NET, architecture, testing, DevOps, and software craftsmanship'
      text: ''
      filters:
        folders:
          - blog
        exclude_featured: false
      count: 5
      order: desc
    design:
      view: card
      columns: 3
      background:
        color:
          light: "#f5f5f5"
          dark: "#08080c"
      spacing:
        padding: ["4rem", "0", "4rem", "0"]

  - block: resume-experience
    id: experience
    content:
      title: Experience
      date_format: Jan 2006
      items:
        - title: Owner
          company: Blueprint Software
          company_url: 'https://www.blueprint.software'
          company_logo: ''
          location: Remote
          date_start: '2025-01-01'
          date_end: ''
        - title: Lead Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          company_logo: ''
          location: Ankeny, IA
          date_start: '2024-06-01'
          date_end: '2025-05-01'
        - title: Senior Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          company_logo: ''
          location: Ankeny, IA
          date_start: '2021-12-20'
          date_end: '2024-06-01'
        - title: Software Engineer III
          company: Comoto Holdings, Inc.
          company_url: 'https://ridecomoto.com/'
          company_logo: ''
          location: Philadelphia, PA
          date_start: '2021-06-28'
          date_end: '2021-11-28'
        - title: Senior Application Developer
          company: Homesteaders Life Company
          company_url: 'https://www.homesteaderslife.com/'
          company_logo: ''
          location: Des Moines, IA
          date_start: '2020-08-17'
          date_end: '2021-06-28'
        - title: Web Application Developer
          company: Polk County
          company_url: 'https://www.polkcountyiowa.gov'
          company_logo: ''
          location: Des Moines, IA
          date_start: '2019-08-21'
          date_end: '2020-08-14'
        - title: Software Engineer
          company: Casey's General Stores
          company_url: 'https://www.caseys.com'
          company_logo: ''
          location: Ankeny, IA
          date_start: '2019-03-16'
          date_end: '2019-08-21'
        - title: Associate Web Developer
          company: Polk County
          company_url: 'https://www.polkcountyiowa.gov'
          company_logo: ''
          location: Des Moines, IA
          date_start: '2016-06-26'
          date_end: '2019-03-16'
    design:
      columns: '1'
      background:
        color:
          light: "#ffffff"
          dark: "#0d0d12"
      spacing:
        padding: ["4rem", "0", "4rem", "0"]

  - block: contact-info
    id: contact
    content:
      title: Get In Touch
      subtitle: "Consulting, collaboration, and software conversations"
      text: |-
        I'm always interested in talking about new projects, consulting opportunities,
        and the work of building better software with other people.
      email: benjamin.sampica@gmail.com
      autolink: true
    design:
      columns: '1'
      background:
        color:
          light: "#ffffff"
          dark: "#0d0d12"
      spacing:
        padding: ["4rem", "0", "4rem", "0"]
---
