# AutoML-Labeling-Tool
ML labeling tool is a UI to assists labeling text for entity extraction in Google AutoML Natural Language API. It speeds labeling of entities on a *sentence by sentence basis*. It runs independently as a client to the AutoML Natural Language API.

## Vision
ML labeling tool is a UI to assist labeling text for entity extraction in Google AutoML Natural Language API. It speeds labeling of entities on a sentence by sentence basis. It runs independently as a client to the AutoML Natural Language API.

## Motivation
Google Cloud AutoML Entity extraction can be trained to identify custom entities from a text string. For example, to train a model that takes the string "Jim bought 300 shares of Acme Corp. in 2006." as input and identifies the following entities: "Jim" as "Person", "Acme Corp." as "Organization", and "2006" as "Time"  With longer document length texts, the entities should be a whole sentence, not a single word or short phrases. 

The PSO ML labeling tool makes it to label or annotate a whole document and show the current prediction on a selected sentence. The prediction is validated or rejected by the SME one sentence at a time. Each predicted sentence contains multiple entities. The sentence accuracy is based on average accuracy of its contained entities.  This allows a whole sentence to receive a label based on the extracted entities of the sentence.

## UI Sample
![User Interface Samle](https://github.com/byronwhitlock-google/AutoML-Labeling-Tool/raw/master/ui.png)
