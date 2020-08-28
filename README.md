# AutoML-Labeling-Tool
ML labeling tool is a UI to assists labeling text for entity extraction in Google AutoML Natural Language API. It speeds labeling of entities on a sentence by sentence basis. It runs independently as a client to the AutoML Natural Language API.

![User Interface Samle](https://github.com/byronwhitlock-google/AutoML-Labeling-Tool/raw/master/ui.png)

##Vision
ML labeling tool is a UI to assist labeling text for entity extraction in Google AutoML Natural Language API. It speeds labeling of entities on a sentence by sentence basis. It runs independently as a client to the AutoML Natural Language API.

##Motivation
Google Cloud AutoML Entity extraction can be trained to identify custom entities from a text string. For example, to train a model that takes the string "Jim bought 300 shares of Acme Corp. in 2006." as input and identifies the following entities: "Jim" as "Person", "Acme Corp." as "Organization", and "2006" as "Time"  With longer document length texts, the entities should be a whole sentence, not a single word or short phrases. 

The AutoML product team is developing an annotation tool, currently in Alpha stage, that will be ultimately integrated with Document AI. You can annotate by drawing boxes on a document, but it doesn't support text-based selection. Additionally single words can be labeled in the Document AI now, up to 10 tokens. Longer document length texts need annotation of more than 10 tokens. The PSO ML labeling tool will fill this gap.

The PSO ML labeling tool will make it easy to label or annotate a whole document and show the current prediction on a selected sentence. The prediction is validated or rejected by the SME one sentence at a time. Each predicted sentence contains multiple entities. The sentence accuracy is based on average accuracy of its contained entities.  This allows a whole sentence to receive a label based on the extracted entities of the sentence.
