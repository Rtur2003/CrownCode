<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap - CrownCode Platform</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          @font-face {
            font-family: 'IM Fell Double Pica';
            src: url('/fonts/im-fell-double-pica-regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Portmanteau';
            src: url('/fonts/portmanteau-regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'IM Fell Double Pica', 'Times New Roman', serif;
            background:
              radial-gradient(120% 120% at 15% 10%, rgba(231, 199, 122, 0.18) 0%, transparent 55%),
              linear-gradient(135deg, #0b0a08 0%, #15110e 100%);
            color: #f4ede3;
            padding: 2rem;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #15110e;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid #2c231b;
          }
          h1 {
            font-family: 'Portmanteau', 'IM Fell Double Pica', serif;
            color: #eac06f;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-align: center;
          }
          .subtitle {
            text-align: center;
            color: #9a8d7d;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #0b0a08;
            border-radius: 8px;
            border: 1px solid #2c231b;
          }
          .stat {
            text-align: center;
          }
          .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #eac06f;
          }
          .stat-label {
            color: #9a8d7d;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background: #0b0a08;
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: linear-gradient(135deg, #eac06f 0%, #c99347 60%, #8a5f2b 100%);
            color: #0b0a08;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
          }
          td {
            padding: 1rem;
            border-bottom: 1px solid #2c231b;
            color: #f4ede3;
          }
          tr:hover {
            background: #1f1914;
          }
          tr:last-child td {
            border-bottom: none;
          }
          a {
            color: #eac06f;
            text-decoration: none;
            transition: color 0.2s;
          }
          a:hover {
            color: #c99347;
            text-decoration: underline;
          }
          .priority {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.85rem;
          }
          .priority-high {
            background: rgba(231, 199, 122, 0.2);
            color: #eac06f;
          }
          .priority-medium {
            background: rgba(127, 176, 105, 0.2);
            color: #7fb069;
          }
          .priority-low {
            background: rgba(154, 141, 125, 0.2);
            color: #9a8d7d;
          }
          .changefreq {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(231, 199, 122, 0.12);
            border-radius: 6px;
            font-size: 0.85rem;
            color: #eac06f;
            border: 1px solid rgba(201, 147, 71, 0.35);
          }
          .footer {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #2c231b;
            color: #9a8d7d;
            font-size: 0.9rem;
          }
          .footer a {
            color: #eac06f;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗺️ XML Sitemap</h1>
          <p class="subtitle">CrownCode Platform - Açık Kaynak Proje Sergisi</p>

          <div class="stats">
            <div class="stat">
              <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
              <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat">
              <div class="stat-value">2</div>
              <div class="stat-label">Domains</div>
            </div>
            <div class="stat">
              <div class="stat-value">2</div>
              <div class="stat-label">Languages</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                  <td>
                    <span class="changefreq">
                      <xsl:value-of select="sitemap:changefreq"/>
                    </span>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:priority &gt;= 0.9">
                        <span class="priority priority-high">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= 0.5">
                        <span class="priority priority-medium">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority priority-low">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <div class="footer">
            <p>
              This sitemap is optimized for search engines. Learn more about
              <a href="https://www.sitemaps.org/" target="_blank">XML Sitemaps</a>
            </p>
            <p style="margin-top: 0.5rem;">
              Generated for <a href="https://crowncode.vercel.app">CrownCode Platform</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
