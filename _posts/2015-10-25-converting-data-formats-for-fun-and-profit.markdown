---
layout: post
title:  "Converting data formats for fun and profit"
date:   2015-10-25 10:00:00
categories: XML CSV data
comments: true
---
Publishing structured data on the Web is a hot topic these days. XML and JSON are go-to formats for HTTP endpoints, because they can be easily consumed by machines. However, these formats are less wieldable for humans though. So, how can we extract data from an XML or JSON document without heavy duty coding?

Some time ago, I needed a flat list of identification numbers, object titles and artists published via a Web API curated by a large museum. The data was formatted in XML. I had to share the list with a co-worker, so I needed an easy and efficient method to convert the dataset into a spreadsheet that we could collaborate on. My idea was to download the data, transform it into CSV, upload it to Google Docs and share it.

I had very limited time, so breaking open my coding toolkit and hacking an entire API client implementation was definitely a no-go. I had to approach the problem more directly.

So, how did I do it? I recently published a new screencast where I demonstrate how I tackled this problem:

<iframe width="560" height="315" src="//www.youtube.com/embed/7A_B7ryHqYk" frameborder="0" allowfullscreen></iframe>

The answer, of course, is using the [XSLT language](https://en.wikipedia.org/wiki/XSLT) to create a transformation stylesheet. An XSLT processor program would convert the XML file to a CSV file based on the mapping and formatting rules I'd define in the stylesheet. Conveniently, OSX comes with a straightforward command line processor called [xsltproc](http://xmlsoft.org/XSLT/xsltproc2.html).

Desiging a workable XSLT stylesheet can be a challenge though. Here are a few pointers:

* Define what you will be outputting: which columns should your CSV contain? Does the data in each column need to be processed to?
* Define a mapping between your input and your output: which XML properties map to which columns?
* Define any conversion logic: do I need to combine data from properties? (ie. first and last names) Do I need to convert dates?
* Identify hard problems: XML is multidimensional, CSV is a flat format. An XML property can contain multiple values, a CSV column holds a single value.
* Take care of character encodings. Try to export your CSV to UTF-8, this encoding set causes the least problems when you want to import the CSV files in other applications.

The basic concepts behind XSLT are fairly easy to grasp. It doesn't take long to get up and running and convert datasets with a straightforward model. However, if your input and output define a complex structure, writing an XSLT stylesheet can be a daunting prospect. In which case you might still want to consider alternative solutions.


