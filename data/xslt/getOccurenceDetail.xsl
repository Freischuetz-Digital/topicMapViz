<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:math="http://www.w3.org/2005/xpath-functions/math" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs math xd tei" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> May 21, 2015</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> benjamin</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
<!--  <xsl:output method="text" omit-xml-declaration="yes" indent="no"/>-->
    <xsl:param name="topicID" required="yes"/>
    <xsl:template match="/">
        <ol>
            <xsl:variable name="matches" as="node()*" select="//tei:*[@key = $topicID]"/>
            <xsl:for-each select="$matches">
                <li>
                    <xsl:call-template name="occurrence">
                        <xsl:with-param name="pos" select="position()"/>
                    </xsl:call-template>
                </li>
            </xsl:for-each>
        </ol>
    </xsl:template>
    <xsl:template name="occurrence">
        <xsl:param name="pos"/>
        <div class="meta">
          <!--<xsl:value-of select="$pos"/>
          <xsl:text>) </xsl:text>-->
            <xsl:value-of select="//tei:teiHeader//tei:title[1]"/>
            <xsl:text>; </xsl:text>
            <xsl:text>Akt </xsl:text>
            <xsl:number count="tei:div[@type='act']" level="any" format="I"/>
            <xsl:text>, Szene </xsl:text>
            <xsl:number count="tei:div[@type='scene']" level="any" format="1"/>
        </div>
        <div class="content">
            <!--<xsl:variable name="text">
                <xsl:apply-templates select="./parent::tei:*"/>
            </xsl:variable>-->
            <xsl:apply-templates select="./parent::tei:*"/>
<!--            <xsl:value-of select="$text"/>-->
        </div>
    </xsl:template>
    <xsl:template match="tei:*[@key = $topicID]">
        <span style="background-color:yellow;">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
</xsl:stylesheet>