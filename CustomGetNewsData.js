const { Node } = require('n8n-core');
const Parser = require('rss-parser');

class CustomGetNewsData extends Node {
    async execute() {
        const rssUrl = this.getInputData('rssUrl');
        const parser = new Parser();

        try {
            const feed = await parser.parseURL(rssUrl);
            const news = feed.items.map(item => ({
                title: item.title,
                content: item.content,
                source: item.link,
                date: item.pubDate
            }));
            return this.prepareOutputData(news);
        } catch (error) {
            throw new Error(`Failed to fetch news data: ${error.message}`);
        }
    }
}

module.exports = CustomGetNewsData;
