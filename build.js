#!/usr/bin/env node
var fs = require('fs-extra');
var path = require('path');

var _ = require('lodash');
var Handlebars = require('handlebars');

var TITLE = 'Custom Decks & Repairs LLC';
var HTML_DIR = path.join(__dirname, 'html');
var BUILD_DIR = path.join(__dirname, 'site');
var TMPL_DIR = path.join(__dirname, 'tmpl');


function templateNameToTitle(filename) {
    var title = filename;
    var words = [title];
    if (filename == 'index') {
        words = [];
    } else if (filename.indexOf('-') > -1) {
        words = filename.split('-');
    }
    words = _.map(words, function(word) {
        return word.substr(0,1).toUpperCase() + word.substr(1);
    });
    title = TITLE + ' ' + words.join(' ');
    return title;
}

function prepareBuildDirectory() {
    fs.removeSync(BUILD_DIR);
    fs.mkdirSync(BUILD_DIR);
}

function executeTemplates() {

    var layoutPath = path.join(TMPL_DIR, 'layout.hbs');
    var layoutText = fs.readFileSync(layoutPath, 'utf8');
    var layoutTmpl = Handlebars.compile(layoutText);
    var galleryPath = path.join(TMPL_DIR, 'gallery.hbs');
    var galleryText = fs.readFileSync(galleryPath, 'utf8');
    var galleryTmpl = Handlebars.compile(galleryText);
    var galleryHtml, fullGalleryHtml;
    var galleryOutPath = BUILD_DIR + '/gallery.html';
    var images;

    // Render all pages in the layout.
    _.each(fs.readdirSync(HTML_DIR), function(tmpl) {
        var name = tmpl.split('.').shift();
        var templateText = fs.readFileSync(path.join(HTML_DIR, tmpl), 'utf8');
        var compiledTemplate = Handlebars.compile(templateText);
        Handlebars.registerPartial(name, compiledTemplate);
        var out = layoutTmpl({
            name: name,
            title: templateNameToTitle(name),
            content: templateText
        });
        var outPath = path.join(BUILD_DIR, tmpl);
        console.log('Writing %s template to:\n\t%s', name, outPath);
        fs.writeFileSync(outPath, out);
    });

    // Render the gallery based on what files are in img/gallery/
    images = fs.readdirSync('img/gallery/');
    galleryHtml = galleryTmpl({images: images});
    fullGalleryHtml = layoutTmpl({
        name: 'gallery',
        title: 'Deck Gallery',
        content: galleryHtml
    });
    console.log('Writing gallery template to:\n\t%s', galleryOutPath);
    fs.writeFileSync(galleryOutPath, fullGalleryHtml);
}

function copyResources() {
    _.each(['css', 'img', 'js'], function(dir) {
        var source = path.join(__dirname, dir);
        var destination = path.join(BUILD_DIR, dir);
        fs.copySync(source, destination);
    });
}

function build() {
    prepareBuildDirectory();
    executeTemplates();
    copyResources();
}

build();

module.exports = build;
