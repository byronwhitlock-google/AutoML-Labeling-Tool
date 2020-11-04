export  function MenuItemSchema(menuItem) 
{
  this.key=menuItem.key||"";
  this.text =menuItem.text||"";
  this.score=menuItem.score||0;
  this.color=menuItem.color||"";
}

export  function ColoredWordSchema(coloredWord)
{
  this.text = coloredWord.text||""; 
  this.color = coloredWord.color||""; 
  this.outline = coloredWord.outline||"";
  this.label = coloredWord.label||"";
  this.score = coloredWord.score||0;
}