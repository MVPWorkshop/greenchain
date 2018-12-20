import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, FormGroup, Input, Label } from "reactstrap";
import AnnotatedSection from "../components/AnnotatedSection";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faStar from "@fortawesome/fontawesome-free-solid/faStar";

class Create extends Component {
  constructor(props) {
    super(props);

    // initialize the component's state
    this.state = {
      name: "",
      description: "",
      latitude: "",
      longitude: "",
      address: "",
      availableCertifications: [],
      selectedCertifications: {},
      customDataInputs: {},
      selectedCategories: {},
      buttonDisabled: false,

      selectedCategory: null,
      selectedSubcategory: null,
      format: null,
      type: null,
      weight: null
    };
    this.onChange = address => this.setState({ address });
  }

  // when the page is loaded, fetch all available certifications
  componentDidMount() {
    this.props.passageInstance
      .getActorCertificationsIds({ from: this.props.web3Accounts[0] })
      .then(result => {
        result.map(certificationId => {
          return this.props.passageInstance
            .getCertificationById(String(certificationId).valueOf())
            .then(result => {
              const certification = {
                name: result[0],
                imageUrl: result[1],
                id: certificationId
              };
              return this.setState({
                availableCertifications: [
                  ...this.state.availableCertifications,
                  certification
                ]
              });
            });
        });
      });
  }

  // method that updates the state when a certification is checked/unchecked
  handleChange = e => {
    const certificationId = e.target.name;
    this.setState({
      selectedCertifications: {
        ...this.state.selectedCertifications,
        [certificationId]: e.target.checked
      }
    });
  };

  productDescription = product => {
    if (!product.Category) {
      return "Waste";
    }

    return `${product.Subcategory} - ${product["Weight (kg)"]} kg`;
  };

  // method that sends the new product's information to the smart contract
  handleCreateNewProduct = () => {
    // generate a 'clean' representation of the selected certifications
    const selectedCertifications = this.state.selectedCertifications;
    const certificationsArray = [];
    Object.keys(selectedCertifications).map(key => {
      if (selectedCertifications[key] === true) {
        return certificationsArray.push(key);
      }
      return false;
    });

    var customDataObject = {};
    Object.keys(this.state.customDataInputs).map(inputKey => {
      const input = this.state.customDataInputs[inputKey];
      if (input.key.trim() !== "" && input.value.trim() !== "") {
        customDataObject[input.key] = input.value;
      }
      return false;
    });

    customDataObject["Owner"] = "Company A";
    customDataObject["Category"] = this.state.selectedCategory;
    customDataObject["Subcategory"] = this.state.selectedSubcategory;
    customDataObject["Waste Type"] = this.state.type;
    customDataObject["Waste Classification"] = this.state.vrsta;
    customDataObject["Q List"] = this.state.qlista;
    customDataObject["Packaging"] = this.state.format;
    customDataObject["Weight (kg)"] = this.state.weight;
    customDataObject["Phase"] = "Baliranje";

    // actually call the smart contract method
    this.props.passageInstance.createProduct(
      this.state.name,
      this.productDescription(customDataObject),
      this.state.latitude.toString(),
      this.state.longitude.toString(),
      certificationsArray,
      JSON.stringify(customDataObject),
      {
        from: this.props.web3Accounts[0],
        gas: 1000000
      }
    );
  };

  handleGeoSelect = address => {
    this.setState({ address, buttonDisabled: true });

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        this.setState({
          latitude: latLng.lat,
          longitude: latLng.lng,
          buttonDisabled: false
        });
      })
      .catch(error => console.error("Error", error));
  };

  // reflected on the page by the render() function
  appendInput(key = "", value = "") {
    var newInputKey = `input-${
      Object.keys(this.state.customDataInputs).length
    }`; // this might not be a good idea (e.g. when removing then adding more inputs)
    this.setState({
      customDataInputs: {
        ...this.state.customDataInputs,
        [newInputKey]: { key: key, value: value }
      }
    });
  }

  updateInputState = name => e => {
    this.setState({
      [name]: e.target.value
    });
  };

  render() {
    return (
      <div>
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faStar}
              />
              Waste information
            </div>
          }
          panelContent={
            <div>
              <FormGroup>
                <Label>Waste ID</Label>
                <Input
                  placeholder="Waste ID"
                  value={this.state.name}
                  onChange={this.updateInputState("name")}
                />
              </FormGroup>
              <FormGroup>
                <Label>Owner</Label>
                <Input disabled placeholder="Owner" value={"Company A"} />
              </FormGroup>
              <FormGroup>
                <Label>Waste categorization</Label>
                <Input
                  type="select"
                  defaultValue=""
                  onChange={this.updateInputState("selectedCategory")}
                >
                  <option disabled value="" key="none">
                    (select)
                  </option>
                  <option value="PET" key="PET">
                    PET
                  </option>
                  <option value="HDPE" key="HDPE">
                    HDPE
                  </option>
                  <option value="PVC" key="PVC">
                    PVC
                  </option>
                  <option value="LDPE" key="LDPE">
                    LDPE
                  </option>
                  <option value="PP" key="PP">
                    PP
                  </option>
                  <option value="PS" key="PS">
                    PS
                  </option>
                  <option value="Other" key="Other">
                    Other
                  </option>
                </Input>
                {this.state.selectedCategory && (
                  <Input
                    type="select"
                    defaultValue=""
                    onChange={this.updateInputState("selectedSubcategory")}
                    style={{ marginTop: 10 }}
                  >
                    <option disabled value="" key="none">
                      (select)
                    </option>
                    <option value="15 01 02 - Plastic" key="15 01 02 - Plastic">
                      15 01 02 - Plastic
                    </option>
                    <option value="15 01 06 Mixed" key="15 01 06 Mixed">
                      15 01 06 Mixed
                    </option>
                    <option
                      value="02 01 04 - Waste plastic"
                      key="02 01 04 - Waste plastic"
                    >
                      02 01 04 - Waste plastic
                    </option>
                  </Input>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Waste Classification</Label>
                <Input
                  type="select"
                  defaultValue=""
                  onChange={this.updateInputState("vrsta")}
                >
                  <option disabled value="">
                    (select)
                  </option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrijski">Industrijski</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Q List</Label>
                <Input
                  type="select"
                  defaultValue=""
                  onChange={this.updateInputState("qlista")}
                >
                  <option disabled value="">
                    (select)
                  </option>
                  <option value="Q1 - Leftovers from production or consumption which aren't otherwise specified">
                    Q1 - Leftovers from production or consumption which aren't
                    otherwise specified
                  </option>
                  <option value="Q2 - Products without specification">
                    Q2 - Products without specification
                  </option>
                  <option value="Q3 - Product whose best before date has expired">
                    Q3 - Product whose best before date has expired
                  </option>
                  <option value="Q4 - Spilled materials, materials which were created due to loss or acident when handling waste, including all materials, equipment and similar contaminated in the accident">
                    Q4 - Spilled materials, materials which were created due to
                    loss or acident when handling waste, including all
                    materials, equipment and similar contaminated in the
                    accident
                  </option>
                  <option value="Q5 - Contaminated or dirty materials created in the process of planned procedure (eg. waste from cleaning procedure)">
                    Q5 - Contaminated or dirty materials created in the process
                    of planned procedure (eg. waste from cleaning procedure)
                  </option>
                  <option value="Q6 - Unusable parts (eg. used batteries, catalyst and others)">
                    Q6 - Unusable parts (eg. used batteries, catalyst and
                    others)
                  </option>
                  <option value="Q7 - Substances which no longer satisfy requirements">
                    Q7 - Substances which no longer satisfy requirements
                  </option>
                  <option value="Q8 - Leftovers from industrial processes">
                    Q8 - Leftovers from industrial processes
                  </option>
                  <option value="Q9 - Waste from the process of polution reduction">
                    Q9 - Waste from the process of polution reduction
                  </option>
                  <option value="Q10 - Waste from mechanical course/fine processing">
                    Q10 - Waste from mechanical course/fine processing
                  </option>
                  <option value="Q11 - Waste from extraction and processing of materials">
                    Q11 - Waste from extraction and processing of materials
                  </option>
                  <option value="Q12 - Materials whose initial composition is contaminated">
                    Q12 - Materials whose initial composition is contaminated
                  </option>
                  <option value="Q13 - Any matter, material or product which usage is forbidden">
                    Q13 - Any matter, material or product which usage is
                    forbidden
                  </option>
                  <option value="Q14 - Product whose owner is discarding as unusable">
                    Q14 - Product whose owner is discarding as unusable
                  </option>
                  <option value="Q15 - Contaminated materials, matter or product created in the process of remediation of land">
                    Q15 - Contaminated materials, matter or product created in
                    the process of remediation of land
                  </option>
                  <option value="Q16 - Any other material, matter or product that is not encompassed in the above mentioned categories">
                    Q16 - Any other material, matter or product that is not
                    encompassed in the above mentioned categories
                  </option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Packaging</Label>
                <Input
                  type="select"
                  defaultValue=""
                  onChange={this.updateInputState("format")}
                >
                  <option disabled value="">
                    (select)
                  </option>
                  <option value="Bale">Bale</option>
                  <option value="Rinfuz">Rinfuz</option>
                  <option value="Wooder Barrel">Wooder Barrel</option>
                  <option value="Canister">Canister</option>
                  <option value="Coffin">Coffin</option>
                  <option value="Sac">Sac</option>
                  <option value="Pressurized container">
                    Pressurized container
                  </option>
                  <option value="Composit packaging">Composit packaging</option>
                  <option value="Scattered state">Scattered state</option>
                  <option value="Other">Other</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Waste Type</Label>
                <Input
                  type="select"
                  defaultValue=""
                  onChange={this.updateInputState("type")}
                >
                  <option disabled value="">
                    (select)
                  </option>
                  <option value="Dangerous waste">Dangerous waste</option>
                  <option value="Non-dangerous waste">
                    Non-dangerous waste
                  </option>
                  <option value="Energy waste">Energy waste</option>
                  <option value="Recyclable waste">Recyclable waste</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Weight (kg)</Label>
                <Input
                  placeholder="eg. 1000"
                  type="number"
                  value={this.state.weight || ""}
                  onChange={this.updateInputState("weight")}
                />
              </FormGroup>

              <FormGroup>
                <Label>Location</Label>
                <PlacesAutocomplete
                  inputProps={{
                    value: this.state.address,
                    onChange: this.onChange,
                    placeholder: "Location"
                  }}
                  onSelect={this.handleGeoSelect}
                  classNames={{ input: "form-control" }}
                />
              </FormGroup>
              <FormGroup>
                {// displays all custom data fields from the state
                Object.keys(this.state.customDataInputs).map(inputKey => (
                  <FormGroup style={{ display: "flex" }} key={inputKey}>
                    <Input
                      value={this.state.customDataInputs[inputKey].key}
                      placeholder="Property (eg. color)"
                      style={{ flex: 1, marginRight: "15px" }}
                      onChange={e => {
                        this.setState({
                          customDataInputs: {
                            ...this.state.customDataInputs,
                            [inputKey]: {
                              ...this.state.customDataInputs[inputKey],
                              key: e.target.value
                            }
                          }
                        });
                      }}
                    />
                    <Input
                      value={this.state.customDataInputs[inputKey].value}
                      placeholder="Value (eg. red)"
                      style={{ flex: 1 }}
                      onChange={e => {
                        this.setState({
                          customDataInputs: {
                            ...this.state.customDataInputs,
                            [inputKey]: {
                              ...this.state.customDataInputs[inputKey],
                              value: e.target.value
                            }
                          }
                        });
                      }}
                    />
                  </FormGroup>
                ))}
                <Link to="#" onClick={() => this.appendInput()}>
                  Add additional information
                </Link>
              </FormGroup>
              <FormGroup>
                <Label>
                  Licences for managing waste
                  <Link
                    style={{ marginLeft: "10px" }}
                    to="/createcertification"
                  >
                    Add +
                  </Link>
                </Label>
                <div>
                  {// displays all available certifications
                  this.state.availableCertifications &&
                  this.state.availableCertifications.length > 0 ? (
                    this.state.availableCertifications.map(
                      (certification, index) => (
                        <div key={index}>
                          <input
                            style={{ marginRight: "5px" }}
                            onChange={this.handleChange}
                            name={certification.id}
                            type="checkbox"
                          />
                          <span>{certification.name}</span>
                        </div>
                      )
                    )
                  ) : (
                    <div style={{ marginLeft: "15px" }}>
                      No available licences.
                      <Link
                        style={{ marginLeft: "10px" }}
                        to="/createcertification"
                      >
                        Add Licence
                      </Link>
                    </div>
                  )}
                </div>
              </FormGroup>
              <Button
                disabled={this.state.buttonDisabled}
                color="primary"
                onClick={this.handleCreateNewProduct}
              >
                Save
              </Button>
            </div>
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    passageInstance: state.reducer.passageInstance,
    web3Accounts: state.reducer.web3Accounts
  };
}

export default connect(mapStateToProps)(Create);
