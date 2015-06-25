<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:exist="http://exist.sourceforge.net/NS/exist" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Jun 24, 2015</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> bwb</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:param name="topicID" required="yes"/>
    <xsl:template match="/">
        <xsl:apply-templates select="@* | node()"/>
    </xsl:template>
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    <!--<xsl:template match="text()">
      <xsl:copy/>
    </xsl:template>-->
    <xsl:template match="tei:*[@key = $topicID]">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <exist:match>
                <xsl:apply-templates select="node()"/>
            </exist:match>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>