import React, { Component } from "react";
import { connect } from "react-redux";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { Link } from "react-router-dom";

import AnnotatedSection from "../components/AnnotatedSection";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faUngroup from "@fortawesome/fontawesome-free-solid/faObjectUngroup";
import faWrench from "@fortawesome/fontawesome-free-solid/faWrench";

import { Button, FormGroup, Input, Label } from "reactstrap";

class SplitProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      children: [],
      availableCertifications: [],
      certifications: []
    };
  }

  componentDidMount() {
    this.props.passageInstance
      .getProductById(
        String(this.props.match.params.productId).valueOf(),
        this.props.match.params.versionId
          ? String(this.props.match.params.versionId).valueOf()
          : "latest"
      )
      .then(result => {
        this.setState({
          name: result[0],
          description: result[1],
          latitude: parseFloat(result[2]),
          longitude: parseFloat(result[3]),
          versionCreationDate: new Date(result[4].c * 1000).toString(),
          versions: [],
          id: this.props.match.params.productId,
          certifications: []
        });

        const certificationsArray = result[6];
        certificationsArray.map(certificationId => {
          return this.props.passageInstance
            .getCertificationById(String(certificationId).valueOf())
            .then(certificationResult => {
              const certification = {
                name: certificationResult[0],
                imageUrl: certificationResult[1],
                id: certificationId
              };
              this.setState({
                certifications: [...this.state.certifications, certification]
              });
            });
        });

        // then, we get the product's versions list
        const versionsArray = result[5];
        versionsArray.map(versionId => {
          this.props.passageInstance
            .getVersionLatLngById(String(versionId).valueOf())
            .then(latLngResult => {
              const version = {
                latitude: parseFloat(latLngResult[0]),
                longitude: parseFloat(latLngResult[1]),
                id: versionId
              };
              this.setState({ versions: [...this.state.versions, version] });
            });
          return false;
        });
      });

    this.props.passageInstance
      .getProductCustomDataById(
        String(this.props.match.params.productId).valueOf(),
        this.props.match.params.versionId
          ? String(this.props.match.params.versionId).valueOf()
          : "latest"
      )
      .then(result => {
        const customData = JSON.parse(result);

        this.setState({
          ...customData
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          customDataJson: ""
        });
      });

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

  addChild = () => {
    // eslint-disable-next-line no-unused-vars
    const { children, availableCertifications, ...parent } = this.state;

    this.setState({
      children: [...children, Object.assign({}, parent)]
    });
  };

  updateChildState = (index, key) => e => {
    const children = this.state.children;
    children[index][key] = e.target.value;

    this.setState({
      children: children
    });
  };

  updateChildAddress = index => address => {
    const children = this.state.children;
    children[index].address = address;

    this.setState({
      children: children
    });
  };

  handleGeoSelect = index => address => {
    this.updateChildAddress(index)(address);

    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        const children = this.state.children;
        children[index].latitude = latLng.lat;
        children[index].longitude = latLng.lng;

        this.setState({
          children: children
        });
      })
      .catch(error => console.error("Error", error));
  };

  handleCertificationSelect = index => e => {
    const certificationId = e.target.name;

    const children = this.state.children;
    children[index].certifications = {
      ...children[index].certifications,
      [certificationId]: e.target.checked
    };

    this.setState({
      children: children
    });

    this.setState({
      certifications: {
        ...this.state.certifications,
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

  handleSplitProduct = () => {
    const { children } = this.state;

    children.forEach(child => {
      let data = Object.assign({}, child);
      delete data.name;
      delete data.description;
      delete data.latitude;
      delete data.longitude;
      delete data.certifications;
      delete data.availableCertifications;
      delete data.id;
      delete data.versionCreationDate;
      delete data.versions;

      console.log("Child:", child);
      console.log("Additional data", data);

      return this.props.passageInstance.splitProduct(
        String(this.props.match.params.productId).valueOf(),
        child.name,
        this.productDescription(child),
        child.latitude
          ? child.latitude.toString()
          : this.state.latitude.toString(),
        child.latitude
          ? child.longitude.toString()
          : this.state.longitude.toString(),
        Object.keys(child.certifications).filter(
          cert => child.certifications[cert] === true
        ),
        JSON.stringify(data),
        {
          from: this.props.web3Accounts[0],

          gas: 800000000
        }
      );
    });
  };

  renderProductForm = index => {
    const data = this.state.children[index];

    return (
      <div key={index} style={{ marginBottom: 40 }}>
        <FormGroup>
          <Label>Waste ID</Label>
          <Input
            placeholder="Waste ID"
            value={data.name}
            onChange={this.updateChildState(index, "name")}
          />
        </FormGroup>
        <FormGroup>
          <Label>Owner</Label>
          <Input disabled placeholder="Owner" value={data["Owner"]} />
        </FormGroup>
        <FormGroup>
          <Label>Packaging</Label>
          <Input
            type="select"
            defaultValue={data["Packaging"]}
            onChange={this.updateChildState(index, "Packaging")}
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
            <option value="Pressurized container">Pressurized container</option>
            <option value="Composit packaging">Composit packaging</option>
            <option value="Scattered state">Scattered state</option>
            <option value="Other">Other</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Waste Type</Label>
          <Input
            type="select"
            defaultValue={data["Waste Type"]}
            onChange={this.updateChildState(index, "Waste Type")}
          >
            <option disabled value="">
              (select)
            </option>
            <option value="Dangerous waste">Dangerous waste</option>
            <option value="Non-dangerous waste">Non-dangerous waste</option>
            <option value="Energy waste">Energy waste</option>
            <option value="Recyclable waste">Recyclable waste</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Weight (kg)</Label>
          <Input
            placeholder="eg. 1000"
            type="number"
            value={data["Weight (kg)"] || ""}
            onChange={this.updateChildState(index, "Weight (kg)")}
          />
        </FormGroup>
      </div>
    );
  };

  render() {
    let indexes = [];
    for (let i = 0; i < this.state.children.length; i++) {
      indexes.push(i);
    }

    return (
      <div>
        {/* Section des produits */}
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faUngroup}
              />
              Waste Treatment
            </div>
          }
          panelContent={
            <div>
              <h2>Treatment result</h2>
              <FormGroup>
                {indexes.map(index => {
                  return this.renderProductForm(index);
                })}
                <Link to="#" onClick={() => this.addChild()}>
                  Add
                </Link>
              </FormGroup>
            </div>
          }
        />

        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faWrench}
              />
              Actions
            </div>
          }
          panelContent={
            <div>
              <Button
                disabled={this.state.buttonDisabled}
                color="primary"
                onClick={this.handleSplitProduct}
              >
                Treat waste
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

export default connect(mapStateToProps)(SplitProduct);
