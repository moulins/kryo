# Via-Type

## Description

Simple type interfaces.

## Install

````bash
npm install
gulp build.node
````

## API ##

### Document ###

````ts
new DocumentType(options: DocumentOptions);
````

Creates a new type to match against documents. This type ensures that the defined properties are set, enumerable and valid.

`DocumentOptions`:

* `properties: Dictionary<PropertyDescriptor>`: Each key is used as the property name and the associated behaviour is determined by the associated `PropertyDescriptor`.

    `PropertyDescriptor`:
    
    * `type: Type`: the type of the property
    
    * `optional: boolean`: whether the property must be set
    
    * `nullable: boolean`: allow the value to be `null`
    
* `additionalProperties: boolean`: Ignore additional properties when doing tests 

#### diff ####

````ts
interface DiffResult {
    $set: Dictionary<jsonValues>;
    $update: Dictionary<Diff>;
    $unset: Dictionary<jsonValues>;
}
````
