// hooks/useMentionInput.js
import { useState, useRef } from 'react';
import { fetchMentions } from '@/api/user';

export const useMentionInput = (initialValue = "", mentionChipClassName = "") => {
  const [input, setInput] = useState(initialValue);
  const [showMentionUI, setShowMentionUI] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const divRef = useRef(null);

  const handleInput = (e) => {
    // Store the innerText from the editable div
    setInput(e.currentTarget.innerText);
    // Use '@' to Trigger Mention UI
    const text = e.currentTarget.innerText;
    const lastAt = text.lastIndexOf("@");
    // If not found lastAt would return -1
    if (lastAt === -1) {
      setShowMentionUI(false);
      setMentionQuery("");
      return;
    }
    // Grab the text after the '@'
    const query = text.slice(lastAt + 1);
    // Regex pattern to stop detecting Mention
    // Allows only one space (since we're parsing full name)
    // punctuation or new line will escape
    const regex = /^([A-Za-z]*)(?: [A-Za-z]*)?$/
    if (regex.test(query)) {
      setShowMentionUI(true);
      setMentionQuery(query);
      fetchMentions(query).then(setMentionResults);
    } else {
      setShowMentionUI(false);
      setMentionQuery("");
    }
  };

  // Parses the text and inserts a <span> for Mention so we can style it
  // Since we're working with a editable <div> rather than <textarea>, we can add HTML tags
  const handleMentionSelect = (user) => {
    if (!divRef.current) return;
    
    // Get the current selection
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    
    // Get current HTML content and preserve existing mention spans
    const currentHTML = divRef.current.innerHTML;
    const currentText = divRef.current.innerText;
    const lastAtIndex = currentText.lastIndexOf("@");
    
    if (lastAtIndex === -1) return;
    
    // Find the text before the @ symbol
    const beforeAt = currentText.slice(0, lastAtIndex);
    
    // Calculate how much text to remove (the @ symbol + the query)
    // The query is everything after the @ until the end or until a space/punctuation
    const afterAtSymbol = currentText.slice(lastAtIndex + 1);
    const queryMatch = afterAtSymbol.match(/^([A-Za-z]*(?: [A-Za-z]*)?)/);
    const queryLength = queryMatch ? queryMatch[0].length : 0;
    const textToRemoveLength = 1 + queryLength; // @ + query
    
    // Create a temporary div to work with the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentHTML;
    
    // Find the last @ symbol in the HTML and replace it with the mention span
    let found = false;
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    let currentOffset = 0;
    
    while (node = walker.nextNode()) {
      const text = node.textContent;
      const atIndex = text.indexOf("@", currentOffset - currentOffset);
      
      if (atIndex !== -1 && currentOffset + atIndex >= lastAtIndex) {
        // Found the @ we want to replace
        const beforeText = text.slice(0, atIndex);
        
        // Calculate the position where the mention text ends in this node
        const mentionStartInNode = atIndex;
        const mentionEndInNode = Math.min(atIndex + textToRemoveLength, text.length);
        
        // Get text after the mention (if any)
        const afterText = text.slice(mentionEndInNode);
        
        // Create mention span
        const mentionSpan = document.createElement("span");
        mentionSpan.textContent = `@${user.full_name}`;
        mentionSpan.contentEditable = "false";
        mentionSpan.className = mentionChipClassName;
        
        // Replace the text node with the mention span and remaining text
        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(afterText);
        const spaceNode = document.createTextNode(" ");
        
        node.parentNode.insertBefore(beforeNode, node);
        node.parentNode.insertBefore(mentionSpan, node);
        node.parentNode.insertBefore(spaceNode, node);
        node.parentNode.insertBefore(afterNode, node);
        node.parentNode.removeChild(node);
        
        found = true;
        break;
      }
      currentOffset += text.length;
    }
    
    if (found) {
      // Update the original div with the new HTML
      divRef.current.innerHTML = tempDiv.innerHTML;
      
      // Set cursor position after the mention
      const range = document.createRange();
      const mentionSpan = divRef.current.querySelector('span[contenteditable="false"]:last-of-type');
      if (mentionSpan && mentionSpan.nextSibling) {
        range.setStartAfter(mentionSpan.nextSibling); // After the space
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      
      divRef.current.focus();
      
      // Update plain text state
      setInput(beforeAt + `@${user.full_name} `);
    }
    
    // Hide mention UI
    setShowMentionUI(false);
    setMentionQuery("");
  };

  const clearInput = () => {
    setInput("");
    setMentionQuery("");
    if (divRef.current) {
      divRef.current.innerHTML = "";
    }
  };

  return {
    input,
    divRef,
    showMentionUI,
    mentionResults,
    handleInput,
    handleMentionSelect,
    clearInput
  };
};