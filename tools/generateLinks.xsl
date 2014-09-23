<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    xmlns:xtm="http://www.topicmaps.org/xtm/"
    version="2.0">
    
    <!--   {source: "Microsoft", target: "Amazon", type: "licensing"}, -->
    
    <xsl:output encoding="UTF-8" media-type="text" omit-xml-declaration="yes"></xsl:output>
    
    <xsl:function name="xtm:triplet2JSON">
        <xsl:param name="source"/>
        <xsl:param name="target"/>
        <xsl:param name="type"/>
        <xsl:text>{source: "</xsl:text>
        <xsl:value-of select="$source"/>
        <xsl:text>", target: "</xsl:text>
        <xsl:value-of select="$target"/>
        <xsl:text>", type: "</xsl:text>
        <xsl:value-of select="$type"/>
        <xsl:text>"},</xsl:text>
    </xsl:function>
    
    <xsl:template match="/">
        <!--<xsl:for-each select="//xtm:topic[descendant::xtm:topicRef]">
            <xsl:value-of select="xtm:triplet2JSON(@id,descendant::xtm:topicRef/@href, 'instanceOf')" separator=","/>
        </xsl:for-each>-->
        <!--<xsl:for-each select="//xtm:topicRef">
            <xsl:value-of select="xtm:triplet2JSON(ancestor::xtm:topic/@id,@href, 'instanceOf')" separator=","/>
        </xsl:for-each>-->
        <!--<xsl:text>,</xsl:text>
        <xsl:for-each select="//xtm:occurrence/xtm:resourceRef">
            <xsl:value-of select="xtm:triplet2JSON(ancestor::xtm:topic/@id,@href, 'occurence')" separator=","/>
        </xsl:for-each>-->
        <xsl:for-each select="//xtm:association">
          <!-- membersAndRoles -->
            <xsl:for-each select="xtm:member/xtm:topicRef">
                <xsl:value-of select="xtm:triplet2JSON(@href,preceding-sibling::xtm:roleSpec/xtm:topicRef/@href,'role')"/>
            </xsl:for-each>
          <xsl:for-each select="xtm:member">
            <xsl:variable name="pos" select="position()"/>
            <xsl:for-each select="parent::xtm:topic/xtm:member[position() != $pos ]">
              <xsl:value-of select="xtm:triplet2JSON(.//@href,parent::xtm:association/xtm:instanceOf/xtm:topicRef/@href,'instanceOf')"/>
            </xsl:for-each>
          </xsl:for-each>
            <!--<xsl:value-of select="xtm:triplet2JSON(xtm:member[1]/xtm:topicRef/@href,xtm:member[2]/xtm:topicRef/@href,xtm:instanceOf/xtm:topicRef/@href)"/>-->
        </xsl:for-each>
    </xsl:template>
    
</xsl:stylesheet>